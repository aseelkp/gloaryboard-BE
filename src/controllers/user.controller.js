import { User } from "../models/user.models.js";
import { EventRegistration } from "../models/eventRegistration.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DEPARTMENTS } from "../constants.js";
import { userService } from "../services/user.service.js";


const registerUser = asyncHandler(async (req, res) => {
  const { name , gender , phoneNumber , course , semester , year, capId , dob } = req.body;

  if ( !name || !gender || !phoneNumber || !course || !semester || !year || !capId || !dob ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.file) throw new ApiError(400, "Picture is required");

  req.body.college = req.user.name;
  req.body.image = req.file.path;

  const user = await userService.registerUser(req);


  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));

})


const fetchAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select(
    "-password -__v -created_at -updated_at"
  );

  if (!users) {
    throw new ApiError(404, "No users found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const fetchAllMembers = asyncHandler(async (req, res) => {
  let users;

  if (req.user.user_type === "rep") {
    const departmentGroup = Object.keys(DEPARTMENTS).find((group) =>
      DEPARTMENTS[group].includes(req.user.department)
    );

    if (departmentGroup) {
      users = await User.find({
        department: { $in: DEPARTMENTS[departmentGroup] },
      }).select("-password -__v -created_at -updated_at");
    }

    // users = await User.find({ department: req.user.department }).select(
    //   "-password -__v -created_at -updated_at"
    // );
  } else if (req.user.user_type === "admin") {
    users = await User.find({ user_type: "member" }).select(
      "-password -__v -created_at -updated_at"
    );
  }

  if (!users) {
    throw new ApiError(404, "No users found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  const eventRegistration = await EventRegistration.findOne({
    "participants.user": id,
  });

  if (eventRegistration) {
    throw new ApiError(
      409,
      "User is registered in an event and cannot be deleted"
    );
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});

const fetchDepartments = asyncHandler(async (req, res, next) => {
  res.status(200).json(new ApiResponse(200, DEPARTMENTS, "Departments found"));
});

export const userController = {
  registerUser,
  fetchAllUsers,
  fetchAllMembers,
  deleteUserById,
  fetchDepartments,
};
