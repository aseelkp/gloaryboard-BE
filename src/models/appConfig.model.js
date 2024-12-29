import mongoose from "mongoose";

const appConfigSchema = new mongoose.Schema(
  {
    user_registration: { type: Boolean, required: true },
    hall_ticket_export: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

export const AppConfig = mongoose.model("AppConfig", appConfigSchema);