import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true, enum: ["male", "female"] },
  phoneNumber: { type: String, required: true, unique: true },
  course : { type: String, required: true },
  college: { type: String, required: true },
  semester : { type: Number, required: true },
  year_of_study : {type : Number , required : true},
  capId: { type: String, required: true },
  image: { type: String, required: true },
  dob : { type: Date, required: true },
  total_score: { type: Number, default: 0 }, 
} , {
    timestamps: true,
});

export const User = mongoose.model("User", userSchema);
