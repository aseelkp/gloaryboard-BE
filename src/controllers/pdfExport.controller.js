import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { EventRegistration } from "../models/eventRegistration.models.js";
import { ApiError } from "../utils/ApiError.js";
import { generateParticipantTickets, generateProgramParticipantsList } from "../services/pdfExport.service.js";

const getParticipantTickets = asyncHandler(async (req, res, next) => {
  const collegeId = req.user.id;

  // Fetch users from the specified college
  const users = await User.find({ collegeId });
  if (!users || users.length === 0) {
    return next(new ApiError(404, "No users found for the specified college"));
  }

  // Fetch related data from the EventRegistration collection for each user
  const transformedUsers = await Promise.all(
    users.map(async (user) => {
      const eventRegistrations = await EventRegistration.find({
        "participants.user": user._id,
      })
      .populate({
        path: "event",
        populate: {
          path: "event_type",
        },
      });



      if (eventRegistrations.length === 0) {
        return null;
      }

      const userCollege = (await User.findById(user._id).populate("collegeId")).collegeId.name;

      return {
        regId: user.userId,
        name: user.name.toUpperCase(),
        sex: user.gender.toUpperCase(),
        zone: "C zone",
        college: userCollege,
        course: user.course,
        dateOfBirth: new Date(user.dob).toLocaleDateString("en-GB"),
        image: user.image,
        semester: user.semester.toString(),
        programs: {
          offStage: eventRegistrations
            .filter((reg) => !reg.event.event_type.is_onstage)
            .map((reg) => reg.event.name),
          stage: eventRegistrations
            .filter(
              (reg) =>
                reg.event.event_type.is_onstage &&
                !reg.event.event_type.is_group
            )
            .map((reg) => reg.event.name),
          group: eventRegistrations
            .filter((reg) => reg.event.event_type.is_group)
            .map((reg) => reg.event.name),
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

  const userCollege = (await User.findById(user._id).populate("collegeId")).collegeId.name;

  const transformedUser = [
    {
      regId: user.userId,
      name: user.name.toUpperCase(),
      sex: user.gender.toUpperCase(),
      zone: "C zone",
      college:userCollege,
      course: user.course,
      dateOfBirth: new Date(user.dob).toLocaleDateString("en-GB"),
      image: user.image,
      semester: user.semester.toString(),
      programs: {
        offStage: eventRegistrations
          .filter((reg) => !reg.event.event_type.is_onstage)
          .map((reg) => reg.event.name),
        stage: eventRegistrations
          .filter(
            (reg) =>
              reg.event.event_type.is_onstage && !reg.event.event_type.is_group
          )
          .map((reg) => reg.event.name),
        group: eventRegistrations
          .filter((reg) => reg.event.event_type.is_group)
          .map((reg) => reg.event.name),
      },
    },
  ];

  const pdfByte = await generateParticipantTickets(transformedUser);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${user.name}_participant-ticket.pdf"`,
  });
  res.send(Buffer.from(pdfByte));
});

const getProgramParticipantsListById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const participants = [
    { "name": "Alice Johnson", "college": "University of Kerala" },
    { "name": "Bob Smith", "college": "Cochin University of Science and Technology" },
    { "name": "Charlie Brown", "college": "Mahatma Gandhi University, Kottayam" },
    { "name": "David Wilson", "college": "Calicut University" },
    { "name": "Eve Davis", "college": "Kannur University" },
    { "name": "Frank Thomas", "college": "Kerala Agricultural University" },
    { "name": "Grace Lee", "college": "APJ Abdul Kalam Technological University" },
    { "name": "Hannah White", "college": "St. Teresa's College, Ernakulam" },
    { "name": "Isaac Martinez", "college": "Sacred Heart College, Thevara" },
    { "name": "Jack Taylor", "college": "Farook College, Kozhikode" },
    { "name": "Katie Moore", "college": "Mar Ivanios College, Thiruvananthapuram" },
    { "name": "Liam Anderson", "college": "Christ College, Irinjalakuda" },
    { "name": "Mia Thompson", "college": "Amrita Vishwa Vidyapeetham, Kollam" },
    { "name": "Noah Martin", "college": "MES College, Marampally" },
    { "name": "Olivia Clark", "college": "Government Victoria College, Palakkad" },
    { "name": "Paul Lewis", "college": "St. Joseph's College, Devagiri" },
    { "name": "Quincy Hall", "college": "Union Christian College, Aluva" },
    { "name": "Rachel Walker", "college": "NSS College, Ottapalam" },
    { "name": "Sam Harris", "college": "Govt. Brennen College, Thalassery" },
    { "name": "Tina Young", "college": "St. Berchmans College, Changanassery" },
    { "name": "Uma Patel", "college": "Maharaja's College, Ernakulam" },
    { "name": "Victor King", "college": "CMS College, Kottayam" },
    { "name": "Wendy Scott", "college": "Baselios College, Kottayam" },
    { "name": "Xander Evans", "college": "Government College, Kasaragod" },
    { "name": "Yara Green", "college": "SN College, Kollam" },
    { "name": "Zachary Adams", "college": "Providence College, Kozhikode" }
  ]
  

  const data = {
    name: " THUKAL VADHYANGAL (EASTERN) TABALA / PAKKAVADHYAM",
    type: "Stage",
    participants,
  };

  const pdfByte = await generateProgramParticipantsList(data);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="participants-list.pdf"`,
  });
  res.send(Buffer.from(pdfByte));
});

export const pdfExportController = {
  getParticipantTickets,
  getParticipantTicketById,
  getProgramParticipantsListById,
};
