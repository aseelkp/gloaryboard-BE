import mongoose, { Schema } from "mongoose";

const eventRegistrationSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  group_name: { type: String },
  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      score: { type: Number, default: 0 }, // Score obtained in this event by the user
    },
  ],
  helpers: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ], // Users who helped in organizing
  score: { type: Number, default: 0 }, // Score obtained in this event by the user
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

eventRegistrationSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});



export const EventRegistration = mongoose.model(
  "EventRegistration",
  eventRegistrationSchema
);
