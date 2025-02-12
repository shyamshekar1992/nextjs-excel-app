import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import connectToDatabase from "../../lib/mongo";
import Research from "../../models/Research";

export const config = { api: { bodyParser: false } };

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        await connectToDatabase();

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

        // Find only "Vendor KPI Testimonials" sheet
        const sheetName = workbook.SheetNames.find(name => name.includes("Vendor KPI Testimonials"));
        if (!sheetName) {
            return NextResponse.json({ error: "Sheet 'Vendor KPI Testimonials' not found" }, { status: 400 });
        }

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rawData.length < 2) {
            return NextResponse.json({ error: "Invalid Excel format" }, { status: 400 });
        }

        // **Extract headers correctly and remove empty columns**
        const headers = rawData[0]
            .map(header => (header && !header.includes("__EMPTY")) ? header.trim() : null)
            .filter(header => header !== null); // Remove invalid headers

        // **Transform data into MongoDB-friendly JSON format**
        const jsonData = rawData.slice(1)
            .map(row => {
                let obj = { Category: "Vendor KPI Testimonials" }; // Add category field
                row.forEach((cell, index) => {
                    if (headers[index]) obj[headers[index]] = cell || null; // Keep null instead of "-"
                });
                return obj;
            })
            .filter(row => Object.values(row).some(value => value !== null)); // Remove empty rows

        console.log("📝 Cleaned Data to Upload:", jsonData);

        // **Delete Old Data Before Uploading New Data**
        await Research.deleteMany({ Category: "Vendor KPI Testimonials" });

        // **Insert New Data**
        await Research.insertMany(jsonData);

        return NextResponse.json({ message: "✅ Data uploaded successfully and old data replaced!" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error uploading Excel:", error);
        return NextResponse.json({ error: "Failed to process Excel file" }, { status: 500 });
    }
}
