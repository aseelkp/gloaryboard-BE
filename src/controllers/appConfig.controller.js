import { AppConfig } from "../models/appConfig.model";
import { asyncHandler } from "../utils/asyncHandler";

const getConfigs = asyncHandler(async (req, res) => {
  const configs = await appConfigService.getConfigs();

  if (!configs) {
    throw new ApiError(404, "No configs found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, configs, "Configs fetched successfully"));
});

const updateConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  if (!data) {
    throw new ApiError(400, "Data is required");
  }

  const config = await appConfigService.updateConfig(id, data);

  if (!config) {
    throw new ApiError(500, "Failed to update config");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, config, "Config updated successfully"));
});

export const appConfigController = {
  getConfigs,
  updateConfig,
};
