import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token;
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await Admin.findById(decoded._id).select("-password ");
  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }
  req.user = user;
  next();
});

const verifyRole = (roles) => {
  return (req, _, next) => {
    if (!roles.includes(req.user.user_type)) {
      throw new ApiError(403, "Forbidden access");
    }
    next();
  };
};

export { verifyJWT, verifyRole };
