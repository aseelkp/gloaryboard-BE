import { EventType } from "../models/eventType.models.js";
import { Event } from "../models/event.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const fetchAllEventTypes = asyncHandler(async (req, res, next) => {
  const eventTypes = await EventType.find();

  if (!eventTypes) {
    return next(new ApiError("No event types found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, eventTypes, "Event types fetched successfully"));
});

const createEventType = asyncHandler(async (req, res, next) => {
  const {
    name,
    scores,
    is_group = false,
    is_onstage = true,
    participant_count = 1,
    helper_count = 0,
  } = req.body;

  if (!name || !scores.first || !scores.second || !scores.third) {
    return next(
      new ApiError(
        "Please provide name, scores.first, scores.second, and scores.third",
        400
      )
    );
  }

  const existingEventType = await EventType.findOne({
    name,
    is_group,
    is_onstage,
  });

  if (existingEventType) {
    return next(new ApiError("Event type already exists", 409));
  }

  const eventType = await EventType.create({
    name,
    participant_count,
    helper_count,
    is_group,
    is_onstage,
    scores,
  });

  const createdEventType = await EventType.findById(eventType._id);

  if (!createdEventType) {
    return next(new ApiError("Failed to create event type", 500));
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdEventType, "Event type created successfully")
    );
});

const updateEventType = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const eventType = await EventType.findById(id);

  if (!eventType) {
    return next(new ApiError("Event type not found", 404));
  }

  Object.keys(updateData).forEach((key) => {
    eventType[key] = updateData[key];
  });

  await eventType.save();

  const updatedEventType = await EventType.findById(id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEventType, "Event type updated successfully"));
});

const deleteEventType = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const events = await Event.find({ event_type: id });

  if (events.length > 0) {
    return next(new ApiError(409 , "Event type has events, cannot delete"));
  }


  const eventType = await EventType.findByIdAndDelete(id);

  if (!eventType) {
    return next(new ApiError( 404, "Event type not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Event type deleted successfully"));
});

export const eventTypeController = {
  fetchAllEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
};

