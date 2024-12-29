import { Schema, model } from "mongoose";
import { Counter } from "./counter.model.js";

const resultSchema = new Schema(
  {
    serial_number: { type: Number, unique: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    winningRegistrations: [
      {
        eventRegistration: {
          type: Schema.Types.ObjectId,
          ref: "EventRegistration",
          required: true,
        },
        position: { type: Number, required: true },
      },
    ],
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

resultSchema.pre("save", async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "result" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      console.log(counter, counter?.seq, "counter" || 1);

      doc.serial_number = counter?.seq;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

resultSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export const Result = model("Result", resultSchema);
