import { AppConfig } from "../models/appConfig.model.js";
import { ApiError } from "../utils/ApiError.js";

const getConfigs = async () => {
  try {
    const configs = await AppConfig.find();
    return configs;
  } catch (error) {
    throw error;
  }
};

const addConfig = async (data) => {
  try {
    const config = new AppConfig(data);
    await config.save();
    return config;
  } catch (error) {
    throw error;
  } 
}

const updateConfig = async (id, data) => {
  try {
    const updatedConfig = await AppConfig.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updatedConfig) {
      throw new ApiError(404, "Config not found");
    }

    return updatedConfig;
  } catch (error) {
    throw error;
  }
};

export const appConfigService = { getConfigs, addConfig , updateConfig };
