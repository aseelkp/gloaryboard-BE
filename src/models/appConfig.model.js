import mongoose from "mongoose";

const appConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type : Boolean, required : true }
  },
  {
    timestamps: true,
  } 
);

export const AppConfig = mongoose.model("AppConfig", appConfigSchema);