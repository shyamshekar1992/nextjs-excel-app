"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import UploadPage from "./component/Upload";
import * as XLSX from "xlsx"; // Import xlsx library
import Pagination from "./component/Pagination";

export default function Home() {
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
            const response = await axios.get("/api/research");

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

    /** 
     * Handle Cell Edit and Auto-Save 
     */
    const handleEdit = async (rowIndex, field, value) => {
        const updatedData = [...data];
        updatedData[rowIndex][field] = value;
        setData(updatedData);

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
            alert("No data available to download!");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data.map(row => {
            const newRow = {};
            headers.forEach(header => {
                newRow[header] = row[header] || "-";
            });
            return newRow;
        }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor_KPI_Testimonials");
        XLSX.writeFile(workbook, "Vendor_KPI_Testimonials.xlsx");
    };

    return (
      <><Pagination /><><div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
        <UploadPage />
        <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg p-6 mt-2">
          <h1 className="text-3xl font-semibold text-center mb-4">Vendor KPI Testimonials</h1>

          {loading && <p>Loading data...</p>}
          {error && <p className="text-red-600">{error}</p>}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full mb-2">
            <input
              type="text"
              placeholder="Search..."
              className="w-full md:w-1/2 p-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />
            <button
              onClick={downloadExcel}
              className="mt-2 md:mt-0 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
            >
              📥 Download Excel
            </button>
          </div>

          {data.length > 0 ? (
            <div className="overflow-auto max-h-[500px] border rounded-lg shadow-md">
              <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
                <thead className="bg-blue-600 text-white sticky top-0 z-10">
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index} className="py-2 px-4 border text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.filter(row => JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-100">
                      {headers.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="py-2 px-4 border cursor-text"
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
      </div></></>
    );
}
