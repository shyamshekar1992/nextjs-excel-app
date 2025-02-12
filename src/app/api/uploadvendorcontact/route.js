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
        const sheetName = workbook.SheetNames.find(name => name.includes("Vendor Long List"));
        if (!sheetName) {
            return NextResponse.json({ error: "'Vendor Long List not found not found" }, { status: 400 });
        }

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rawData.length < 2) {
            return NextResponse.json({ error: "Invalid Excel format" }, { status: 400 });
        }

        // **Extract and clean headers**
        const headers = rawData[0]
            .map(header => header && !header.includes("__EMPTY") ? header.trim() : null)
            .filter(header => header !== null); // Remove invalid headers

        // **Transform data into MongoDB-friendly JSON format**
        const jsonData = rawData.slice(1)
            .map(row => {
                let obj = { Category: "Vendor Long List" }; // Add category field
                row.forEach((cell, index) => {
                    if (headers[index]) obj[headers[index]] = cell || null; // Keep null instead of "-"
                });
                return obj;
            })
            .filter(row => Object.values(row).some(value => value !== null)); // Remove empty rows

        console.log("📝 Cleaned Data to Upload:", jsonData);
        await Research.insertMany(jsonData);

        return NextResponse.json({ message: "✅ Excel data uploaded successfully!" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error uploading Excel:", error);
        return NextResponse.json({ error: "Failed to process Excel file" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectToDatabase();

        const { id, updatedData } = await req.json();

        if (!id || !updatedData) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updatedVendor = await Research.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedVendor) {
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "✅ Vendor updated successfully", data: updatedVendor }, { status: 200 });
    } catch (error) {
        console.error("❌ Update error:", error);
        return NextResponse.json({ error: "Failed to update vendor data" }, { status: 500 });
    }
}