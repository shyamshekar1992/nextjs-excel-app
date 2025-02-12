import mongoose from "mongoose";

const ResearchSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.models.Research || mongoose.model("Research", ResearchSchema);
