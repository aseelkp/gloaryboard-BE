import { Event } from "../models/event.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Result } from "../models/result.models.js";
import { EventRegistration } from "../models/eventRegistration.models.js";

const fetchAllEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find()
    .populate({
      path: "event_type",
      select: "-__v -created_at -updated_at",
    })
    .select("-__v");

  if (!events) {
    return next(new ApiError("No events found", 404));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events fetched successfully"));
});

const fetchResultPublishedEvents = asyncHandler(async (req, res, next) => {
  const aggregate = [
    {
      $lookup: {
        from: "events",
        localField: "event",
        foreignField: "_id",
        as: "eventDetails",
      },
    },
    {
      $unwind: "$eventDetails",
    },
    {
      $group: {
        _id: "$eventDetails._id",
        name: { $first: "$eventDetails.name" },
        last_updated: { $max: "$updated_at" },
      },
    },
  ];

  const events = await Result.aggregate(aggregate);

  if (!events) {
    return next(new ApiError(404, "No events found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events fetched successfully"));
});

const createEvent = asyncHandler(async (req, res, next) => {
  const { name, event_type } = req.body;

  if (!name || !event_type) {
    return next(new ApiError("Please provide name and eventTypeId", 400));
  }

  const existingEvent = await Event.findOne({
    name,
    event_type,
  });

  if (existingEvent) {
    return next(new ApiError("Event already exists", 409));
  }

  const event = await Event.create({
    name,
    event_type,
  });

  const createdEvent = await Event.findById(event._id);

  if (!createdEvent) {
    return next(new ApiError("Failed to create event", 500));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdEvent, "Event created successfully"));
});

const updateEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, event_type } = req.body;

  const event = await Event.findById(id);

  if (!event) {
    return next(new ApiError("Event not found", 404));
  }

  if (name) event.name = name;
  if (event_type) event.event_type = event_type;

  await event.save();

  const updatedEvent = await Event.findById(id)
    .populate("event_type")
    .select("-__v -created_at -updated_at");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

const deleteEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const eventRegistrations = await EventRegistration.find({ event: id });

  if (eventRegistrations.length > 0) {
    return next(new ApiError(409, "Event has registrations, cannot delete"));
  }

  const event = await Event.findByIdAndDelete(id);

  if (!event) {
    return next(new ApiError(500, "Failed to delete event"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Event deleted successfully"));
});

export const eventController = {
  fetchAllEvents,
  fetchResultPublishedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
