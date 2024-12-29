import { appConfigService } from "../services/appConfig.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getConfigs = asyncHandler(async (req, res) => {
  const configs = await appConfigService.getConfigs();

  if (!configs) {
    throw new ApiError(404, "No configs found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, configs, "Configs fetched successfully"));
});

const addConfig = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data) {
    throw new ApiError(400, "Data is required");
  }

  const config = await appConfigService.addConfig(data);

  if (!config) {
    throw new ApiError(500, "Failed to add config");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, config, "Config added successfully"));
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
  let config;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    config = await appConfigService.updateConfig(id, data);
  } else {
    throw new ApiError(400, "Invalid id");
  }

  if (!config) {
    throw new ApiError(500, "Failed to update config");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, config, "Config updated successfully"));
});

export const appConfigController = {
  getConfigs,
  addConfig,
  updateConfig,
};
