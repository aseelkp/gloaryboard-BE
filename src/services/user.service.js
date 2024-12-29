import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { storageService } from "./storage.service.js";

const registerUser = async (req) => {
  const data = req.body;
  const fileName = req.file.originalname;
  const imageLocalPath = req.file.path;

  try {
    const existingUser = await User.findOne({
      $or: [{ phoneNumber: data.phoneNumber }],
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "User with this phone number already exists"
      );
    }
    const user = await User.create({
      ...data,
    });
    var image = await storageService.uploadToSpace(fileName , imageLocalPath, user._id);
    if (!image) {
      throw new ApiError(500, "Failed to upload image");
    }
    user.image = image;
    await user.save();

    const createdUserWithImage = await User.findById(user._id).select(
      "-password"
    );

    return createdUserWithImage;
  } catch (error) {
    console.log(error, "Error creating user");
    if (image) {
      await storageService.deleteFromSpace(image);
    }

    throw error;
  }
};

export const userService = {
  registerUser,
};
