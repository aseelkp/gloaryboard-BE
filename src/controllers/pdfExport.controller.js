import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { EventRegistration } from "../models/eventRegistration.models.js";
import { ApiError } from "../utils/ApiError.js";
import { generateParticipantTickets } from "../services/pdfExport.service.js";

function chunkArray(array, chunkSize = 14) {
  const chunks = [];
  for (let i = 0; i < array?.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const getParticipantTickets = asyncHandler(async (req, res, next) => {
  const collegeName = req.user.name;

  // Fetch users from the specified college
  const users = await User.find({ college: collegeName });
  if (!users || users.length === 0) {
    return next(new ApiError(404, "No users found for the specified college"));
  }

  // Fetch related data from the EventRegistration collection for each user
  const transformedUsers = await Promise.all(
    users.map(async (user) => {
      const eventRegistrations = await EventRegistration.find({
        "participants.user": user._id,
      }).populate({
        path: "event",
        populate: {
          path: "event_type",
        },
      });

      if (eventRegistrations.length === 0) {
        return null;
      }

      return {
        regId: user.userId,
        name: user.name.toUpperCase(),
        sex: user.gender.toUpperCase(),
        zone: "C zone",
        college: user.college,
        course: user.course,
        dateOfBirth: new Date(user.dob).toLocaleDateString(),
        image: user.image,
        semester: user.semester.toString(),
        programs: {
          offStage: chunkArray(eventRegistrations
            .filter((reg) => !reg.event.event_type.is_onstage)
            .map((reg) => reg.event.name)),
          stage: chunkArray(eventRegistrations
            .filter((reg) => reg.event.event_type.is_onstage && !reg.event.event_type.is_group)
            .map((reg) => reg.event.name)),
          group: chunkArray(eventRegistrations
            .filter((reg) => reg.event.event_type.is_group)
            .map((reg) => reg.event.name)),
        },
      };
    })
  );

  // Filter out users who don't have any event registrations
  const filteredUsers = transformedUsers.filter((user) => user !== null);

  if (filteredUsers.length === 0) {
    return next(new ApiError(404, "No valid registrations found"));
  }

  const pdfBytes = await generateParticipantTickets(filteredUsers);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="participant-tickets.pdf"',
  });
  res.send(Buffer.from(pdfBytes));
});

const getParticipantTicketById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  if (!user) {
    return next(new ApiError(404, "User not found with the specified regId"));
  }

  const eventRegistrations = await EventRegistration.find({
    "participants.user": user._id,
  }).populate({
    path: "event",
    populate: {
      path: "event_type",
    },
  });  

  if (eventRegistrations.length === 0) {
    return next(new ApiError(404, "No registrations found for the user"));
  }

  const transformedUser = [{
    regId: user.userId,
    name: user.name.toUpperCase(),
    sex: user.gender.toUpperCase(),
    zone: "C zone",
    college: user.college,
    course: user.course,
    dateOfBirth: new Date(user.dob).toLocaleDateString(),
    image: user.image,
    semester: user.semester.toString(),
    programs: {
      offStage: chunkArray(eventRegistrations
        .filter((reg) => !reg.event.event_type.is_onstage)
        .map((reg) => reg.event.name)),
      stage: chunkArray(eventRegistrations
        .filter((reg) => reg.event.event_type.is_onstage && !reg.event.event_type.is_group)
        .map((reg) => reg.event.name)),
      group: chunkArray(eventRegistrations
        .filter((reg) => reg.event.event_type.is_group)
        .map((reg) => reg.event.name)),
    }
  }]

  const pdfByte = await generateParticipantTickets(transformedUser);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${user.name}_participant-ticket.pdf"`,
  });
  res.send(Buffer.from(pdfByte));
});

export const pdfExportController = {
  getParticipantTickets,
  getParticipantTicketById
};
