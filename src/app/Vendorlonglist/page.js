"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import VendorUpload from "../component/VendorUpload";
import Pagination from "../component/Pagination";
import VendorCharts from "../component/Vendorchart";

export default function Home() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  /** Fetch Data from Backend */
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/getvendorlonglist");
      if (!response.data) {
        throw new Error("No data received from the backend.");
      }
      const rawData = response.data;
      console.log("✅ Data Received from Backend:", rawData);

      if (rawData.length > 0) {
        const validHeaders = Object.keys(rawData[0]).filter(
          (header) =>
            !header.includes("__EMPTY") && header !== "_id" && header !== "__v"
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

  /** Pagination Logic */
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = data
    .filter((row) =>
      JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Pagination
        paginate={paginate}
        currentPage={currentPage}
        totalRecords={data.length}
        recordsPerPage={recordsPerPage}
      />
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
        {/* Header */}

        <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg p-6 mt-6">
          <VendorUpload />

          {loading && <p>Loading data...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {/* Search Bar */}
          <div className="w-full mb-4">
            <input
              type="text"
              placeholder="Search Vendors..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 📊 Vendor Size Distribution Chart */}

          {/* 📌 Editable Table */}
          <div className="overflow-auto max-h-[500px] border rounded-lg shadow-md mt-6">
            <h2 className="text-lg font-semibold text-center mb-2">
              Vendor Data Table (Editable)
            </h2>
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
                {currentRecords.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="odd:bg-gray-50 even:bg-white hover:bg-gray-200 transition duration-200"
                  >
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="py-2 px-4 border cursor-text whitespace-nowrap min-w-[150px] max-w-[300px] overflow-hidden text-ellipsis"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleEdit(rowIndex, header, e.target.innerText)
                        }
                      >
                        {row[header] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <VendorCharts data={data} />
        </div>
      </div>
    </>
  );
}
