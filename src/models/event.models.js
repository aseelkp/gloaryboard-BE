import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema({
  name: { type: String, required: true },
  event_type: { type: Schema.Types.ObjectId, ref: "EventType", required: true },
  event_category: { type : String, required: true },
  result_category: { type: String, required: true },
  participant_count: { type: Number, required: true },
});


export const Event = mongoose.model("Event", eventSchema);