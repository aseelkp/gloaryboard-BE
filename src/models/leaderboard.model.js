import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    totalResultCount: { type: Number, required: true },
    lastCount: { type: Number, required: true },
    results: { type: Array, required: true },
    categoryTopScorers: { type: Array, required: true },
    genderTopScorers: { type: Array, required: true },
  },
  { timestamps: true }
);

export const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);
