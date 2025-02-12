"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import xlsx library
import VendorUpload from "../component/VendorUpload";

export default function Vendorpage() {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /** 
     * Fetch Data from Backend
     */
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/getvendor");

            if (response.status !== 200 || !response.data) {
                throw new Error("No data received from the backend.");
            }

            const rawData = response.data;
            console.log("✅ Data Received from Backend:", rawData);

            if (rawData.length > 0) {
                // Filter out invalid headers (`_id`, `__v`, `__EMPTY`)
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

    /** 
     * Handle Cell Edit and Auto-Save 
     */
    const handleEdit = async (rowIndex, field, value) => {
        const updatedData = [...data];
        updatedData[rowIndex][field] = value;
        setData(updatedData); // Update UI instantly

        try {
            await axios.put("/api/research", {
                id: updatedData[rowIndex]._id,
                updatedData: { [field]: value },
            });
            console.log("✅ Field updated successfully:", field, value);
        } catch (error) {
            console.error("❌ Update error:", error);
        }
    };

    /**
     * Download Excel File with Updated Data
     */
    const downloadExcel = () => {
        if (data.length === 0) {
            alert("No Vendor available to download!");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data.map(row => {
            const newRow = {};
            headers.forEach(header => {
                newRow[header] = row[header] || "-"; // Include only required headers
            });
            return newRow;
        }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor Contacts");

        // Generate Excel File and Download
        XLSX.writeFile(workbook, "Vendor_Contacts.xlsx");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <VendorUpload />

            <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-semibold text-center mb-6">Vendor KPI Testimonials</h1>

                {/* Display loading or error messages */}
                {loading && <p>Loading data...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {/* Download Button */}
                <button 
                    onClick={downloadExcel}
                    className="mb-4 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                >
                    📥 Download Excel
                </button>

                {/* Search Input */}
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full p-2 border mt-4 rounded"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Editable Table */}
                {data.length > 0 ? (
                    <div className="overflow-x-auto mt-6">
                        <table className="min-w-full bg-white border shadow-md rounded-lg">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} className="py-2 px-4 border">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.filter(row =>
                                    JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {headers.map((header, colIndex) => (
                                            <td 
                                                key={colIndex} 
                                                className="py-2 px-4 border"
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
                ) : (
                    <p className="text-gray-600 mt-4">No data found.</p>
                )}
            </div>
        </div>
    );
}
