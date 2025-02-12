"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import VendorUpload from "../component/VendorUpload";
import Pagination from "../component/Pagination";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function Home() {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    /** Fetch Data from Backend */
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/getvendorlonglist");
            if (response.status !== 200 || !response.data) {
                throw new Error("No data received from the backend.");
            }
            const rawData = response.data;
            console.log("✅ Data Received from Backend:", rawData);

            if (rawData.length > 0) {
                const validHeaders = Object.keys(rawData[0]).filter(
                    (header) => !header.includes("__EMPTY") && header !== "_id" && header !== "__v"
                );
                setHeaders(validHeaders);
                setData(rawData);
            } else {
                setError("No data available.");
            }
        } catch (err) {
            console.error("❌ Fetch error:", err);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /** Handle Cell Edit and Auto-Save */
    const handleEdit = async (rowIndex, field, value) => {
        const updatedData = [...data];
        updatedData[rowIndex][field] = value;
        setData(updatedData);

        try {
            await axios.put("/api/uploadvendorcontact", {
                id: updatedData[rowIndex]._id,
                updatedData: { [field]: value },
            });
            console.log("✅ Field updated successfully:", field, value);
        } catch (error) {
            console.error("❌ Update error:", error);
        }
    };

    return (
        <>
                        <Pagination />

            {/* 🔹 Header */}
            <h1 className="text-3xl font-semibold text-center my-4">Vendor KPI Testimonials</h1>

            <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
                <VendorUpload />

                <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg p-6 mt-2">
                    {loading && <p>Loading data...</p>}
                    {error && <p className="text-red-600">{error}</p>}

                    {/* 🔎 Search Bar */}
                    <div className="w-full mb-4">
                        <input
                            type="text"
                            placeholder="Search Vendors..."
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* 📊 Revenue Bar Chart */}
                    <div className="bg-white shadow rounded-lg p-4 mt-6">
                        <h2 className="text-lg font-semibold text-center mb-2">Revenue Distribution (€b)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data} layout="vertical">
                                <XAxis type="number" />
                                <YAxis dataKey="AI Vendor" type="category" width={150} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Revenue \n(€b, 2023" fill="#3182CE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ✏ Editable Table */}
                    <div className="overflow-auto max-h-[500px] border rounded-lg shadow-md mt-6">
                        <h2 className="text-lg font-semibold text-center mb-2">Vendor Data Table (Editable)</h2>
                        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg text-sm">
                            <thead className="bg-blue-600 text-white sticky top-0 z-10">
                                <tr>
                                    {headers.map((header, index) => (
                                        <th
                                            key={index}
                                            className="py-2 px-4 border text-left whitespace-nowrap min-w-[150px] max-w-[300px] overflow-hidden text-ellipsis"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data
                                    .filter(row => JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((row, rowIndex) => (
                                        <tr key={rowIndex} className="odd:bg-gray-50 even:bg-white hover:bg-gray-200 transition duration-200">
                                            {headers.map((header, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className="py-2 px-4 border cursor-text whitespace-nowrap min-w-[150px] max-w-[300px] overflow-hidden text-ellipsis"
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleEdit(rowIndex, header, e.target.innerText)}
                                                >
                                                    {row[header] || "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 📊 Customer Focus Pie Chart */}
                    <div className="bg-white shadow rounded-lg p-4 mt-6">
                        <h2 className="text-lg font-semibold text-center mb-2">Customer Focus Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={data} dataKey="Customer Focus (Small / Medium / Enterprise)" nameKey="AI Vendor" cx="50%" cy="50%" outerRadius={100} fill="#38A169" label>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={["#3182CE", "#38A169", "#E53E3E"][index % 3]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}
