import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.model.js";
import { authServices } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


const fetchAllOrgs = asyncHandler(async (req, res) => {
  const users = await Admin.find({ user_type: "organization" }).select(
    "-password -__v -created_at -updated_at"
  );

  if (!users) {
    throw new ApiError(404, "No users found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const registerOrg = asyncHandler(async (req, res) => {

    const { name , email, password , phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await authServices.registerOrg(req.body);
    
    if (!user) {
        throw new ApiError(500, "Failed to create user");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User created successfully"));
});

export const adminController = {
    fetchAllOrgs,
    registerOrg
}