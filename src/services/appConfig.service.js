import { AppConfig } from "../models/appConfig.model";

const getConfigs = async (data) => {
  try {
    const configs = await AppConfig.find();
    return configs;
  } catch (error) {
    throw error;
  }
};

const updateConfig = async (id, data) => {
  try {
    const config = await AppConfig.findById(id);
    if (!config) {
      throw new ApiError(404, "Config not found");
    }

    Object.keys(data).forEach((key) => {
      config[key] = data[key];
    });

    await config.save();

    const updatedConfig = await AppConfig.findById(id);

    return updatedConfig;
  } catch (error) {
    throw error;
  }
};

const appConfigService = { getConfigs, updateConfig };
