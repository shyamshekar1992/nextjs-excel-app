"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMessage, setUploadMessage] = useState("");
    const router = useRouter(); // For navigation after upload

    /** 
     * Handle file selection 
     */
    const { getRootProps, getInputProps } = useDropzone({
        accept: ".xlsx, .xls",
        onDrop: (acceptedFiles) => {
            setFile(acceptedFiles[0]);
            setUploadMessage(""); // Reset message when new file is selected
        }
    });

    /** 
     * Upload Excel File to Backend
     */
    const uploadExcel = async () => {
        if (!file) return alert("⚠️ Please upload a file!");

        setUploading(true);
        setUploadProgress(0);
        setUploadMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/upload", formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            setUploading(false);
            setUploadMessage("✅ File uploaded successfully!");
            setFile(null); // Clear file after upload

            setTimeout(() => {
                router.push("/"); // Redirect to the main table page
            }, 1500);
        } catch (error) {
            setUploading(false);
            setUploadMessage("❌ Upload failed!");
            console.error("Upload error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                    Upload Vendor KPI Testimonials
                </h1>

                {/* File Dropzone */}
                <div {...getRootProps()} 
                    className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                    <input {...getInputProps()} />
                    <p className="text-gray-600 font-medium">📂 Drag & Drop an Excel file here, or click to upload</p>
                </div>

                {/* File Preview */}
                {file && (
                    <div className="mt-4 p-4 bg-gray-200 rounded-md shadow">
                        <p className="text-gray-700 font-medium">📁 File: {file.name}</p>
                        <p className="text-gray-600">Size: {(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                )}

                {/* Upload Button */}
                <button 
                    onClick={uploadExcel} 
                    disabled={!file || uploading}
                    className={`mt-4 px-4 py-2 rounded text-white ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                    {uploading ? "Uploading..." : "Upload Excel"}
                </button>

                {/* Upload Progress Bar */}
                {uploading && (
                    <div className="w-full bg-gray-300 mt-4 rounded-md overflow-hidden">
                        <div 
                            className="bg-green-500 text-xs text-white text-center p-1 rounded-md"
                            style={{ width: `${uploadProgress}%` }}
                        >
                            {uploadProgress}%
                        </div>
                    </div>
                )}

                {/* Upload Message */}
                {uploadMessage && (
                    <div className={`mt-4 ${uploadMessage.includes("✅") ? "text-green-600" : "text-red-600"} font-semibold`}>
                        {uploadMessage}
                    </div>
                )}

                {/* Go Back Button */}
                <button 
                    onClick={() => router.push("/")} 
                    className="mt-4 px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                >
                    View Data
                </button>
            </div>
        </div>
    );
}
