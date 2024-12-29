import { AppConfig } from "../models/appConfig.model.js";

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
    const config = await AppConfig.findById(id);
    if (!config) {
      throw new ApiError(404, "Config not found");
    }

    config.value = data.value;

    await config.save();

    const updatedConfig = await AppConfig.findById(id);

    return updatedConfig;
  } catch (error) {
    throw error;
  }
};

export const appConfigService = { getConfigs, addConfig , updateConfig };
