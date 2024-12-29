import mongoose, { Schema } from "mongoose";

const eventTypeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    is_group: { type: Boolean, required: true },
    is_onstage: { type: Boolean, required: true },
    scores: {
      first: { type: Number, required: true },
      second: { type: Number, required: true },
      third: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export const EventType = mongoose.model("EventType", eventTypeSchema);
