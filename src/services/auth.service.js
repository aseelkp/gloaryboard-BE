import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

const generateAccessToken = async (userId) => {
  try {
    const user = await Admin.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();

    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens");
  }
};

const registerAdmin = async (data) => {
  try {
    const {email , phoneNumber} = data 
    const existingAdmin = await Admin.findOne({
      $or : [{email} , {phoneNumber}]
    })

    if (existingAdmin) throw new ApiError(409, "Admin with this email or phone number already exists");

    const admin = await Admin.create({
      ...data,
    });

    const createdAdmin = await Admin.findById(admin._id).select("-password");

    return createdAdmin;

  } catch (error) {
    throw new ApiError(500, "Failed to register admin");
  }
}

const registerOrg = async (data) => {
  try {
    
    const { name, email, password, phoneNumber } = data;

    const existingUser = await Admin.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      throw new ApiError(409, "User with this email or phone number already exists");
    }

    const user = await Admin.create({
      user_type: "organization",
      ...data,
    });

    const createdUser = await Admin.findById(user._id).select("-password");

    if (!createdUser) {
      throw new ApiError(500, "Failed to create user");
    }

    return createdUser;
  } catch (error) {
    throw error;
  }
}

export const authServices = {
  generateAccessToken,
  registerAdmin,
  registerOrg,
}

