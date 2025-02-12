import { NextResponse } from "next/server";
import connectToDatabase from "../../lib/mongo";
import Research from "../../models/Research";

// ✅ GET: Fetch only "Vendor KPI Testimonials"
export async function GET() {
    try {
        await connectToDatabase();

        // Filter to include only documents related to "Vendor KPI Testimonials"
        const data = await Research.find({ "Category": "Vendor KPI Testimonials" });

        if (!data.length) {
            return NextResponse.json({ error: "No KPI Testimonials data found" }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching KPI Testimonials data:", error);
        return NextResponse.json({ error: "Failed to fetch KPI Testimonials data" }, { status: 500 });
    }
}

// ✅ PUT: Update a specific research record
export async function PUT(req) {
    try {
        await connectToDatabase();
        
        const { id, updatedData } = await req.json();

        if (!id || !updatedData) {
            return NextResponse.json({ error: "Missing ID or update data" }, { status: 400 });
        }

        const updatedRecord = await Research.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedRecord) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Updated successfully!", updatedRecord }, { status: 200 });
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
    }
}
