import { Event } from "../models/event.models.js";

const createEvent = async (data) => {
  try {
    const existingEvent = await Event.findOne({
      name: data.name,
      event_type: data.event_type,
      event_category: data.event_category,
    });

    if (existingEvent) {
      throw new ApiError(400, "Event already exists");
    }

    const event = await Event.create(data);

    return event;
  } catch (error) {
    throw error;
  }
};

export const eventServices = { createEvent };
