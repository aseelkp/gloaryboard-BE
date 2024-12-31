import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.model.js";
import { authServices } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { adminService } from "../services/admin.service.js";


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

const updateOrg = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password, phoneNumber } = req.body;

    const user = await Admin.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (email && email !== user.email) {
        const existingUser = await Admin.findOne({ email });
        if (existingUser && existingUser._id.toString() !== id) {
            throw new ApiError(409, "Email already exists");
        }
        user.email = email;
    }

    if (phoneNumber && phoneNumber !== user.phoneNumber) {
        const existingUser = await Admin.findOne({ phoneNumber });
        if (existingUser && existingUser._id.toString() !== id) {
            throw new ApiError(409, "Phone number already exists");
        }
        user.phoneNumber = phoneNumber;
    }

    if (name) user.name = name;
    if (password) user.password = password;

    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User updated successfully"));
});

const deleteOrg = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Id is required");
    }

    const org = await adminService.deleteOrg(id);

    if (!org) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "User deleted successfully"));
});

export const adminController = {
    fetchAllOrgs,
    registerOrg,
    updateOrg,
    deleteOrg
}
