import fs from "fs";
import handlebars from "handlebars";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { EventRegistration } from "../models/eventRegistration.models.js";
import { ApiError } from "../utils/ApiError.js";
import { generateParticipantTickets } from "../services/pdfExport.service.js";

const copies = ["c-zone copy", "student copy"];

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
  // const transformedUsers = await Promise.all(
  //   users.map(async (user) => {
  //     const eventRegistrations = await EventRegistration.find({
  //       "participants.user": user._id,
  //     }).populate("event");

  //     if (eventRegistrations.length === 0) {
  //       return null;
  //     }

  //     return {
  //       regId: user.userId,
  //       name: user.name.toUpperCase(),
  //       sex: user.gender,
  //       zone: "C zone",
  //       college: user.college,
  //       course: user.course,
  //       dateOfBirth: new Date(user.dob).toLocaleDateString(),
  //       image: user.image,
  //       programs: {
  //         offStage: chunkArray(eventRegistrations
  //           .filter((reg) => !reg.event.is_onstage)
  //           .map((reg) => reg.event.name)),
  //         stage: chunkArray(eventRegistrations
  //           .filter((reg) => reg.event.is_onstage && !reg.event.is_group)
  //           .map((reg) => reg.event.name)),
  //         group: chunkArray(eventRegistrations
  //           .filter((reg) => reg.event.is_group)
  //           .map((reg) => reg.event.name)),
  //       },
  //     };
  //   })
  // );

  const transformedUsers = [
		{
			name: "John Doe",
			sex: "Male",
			zone: "C zone",
			college: "EMEA College of Arts and Science, Kondotty",
			course: "Computer Science",
			dateOfBirth: "21/11/2005",
			programs: {
				offStage: chunkArray(["Quiz", "Essay Writing", "Pencil Drawing with", "Poetry", "Essay Writing", "Pencil Drawing with color", "Poetry", "Essay Writing", "Pencil Drawing with color", "Poetry", "Essay Writing", "Pencil Drawing last", "Poetry", "Essay Writing", "Glory Program", "Glory Program last"]),
				stage: chunkArray(["Solo Dance", "Mappilappattu", "Singing"]),
				group: chunkArray(["Group Dance", "Drama", "Duff Muttu"])
			}
		},
		{
			name: "Jane Smith",
			sex: "Female",
			zone: "A zone",
			college: "ABC University",
			course: "Mathematics",
			dateOfBirth: "15/05/2004",
			programs: {
				offStage: chunkArray(["Debate", "Poetry"]),
				group: chunkArray(["Choir", "Theater"])
			}
		},
		// {
		// 	name: "Alice Johnson",
		// 	sex: "Female",
		// 	zone: "B zone",
		// 	college: "XYZ College",
		// 	course: "Physics",
		// 	dateOfBirth: "10/12/2003",
		// 	programs: {
		// 		offStage: chunkArray(["Painting", "Essay Writing"]),
		// 		stage: chunkArray(["Drama"]),
		// 	}
		// },
		// {
		// 	name: "Bob Brown",
		// 	sex: "Male",
		// 	zone: "D zone",
		// 	college: "LMN Institute",
		// 	course: "Chemistry",
		// 	dateOfBirth: "22/08/2002",
		// 	programs: {
		// 		stage: chunkArray(["Solo Dance"]),
		// 		group: chunkArray(["Band Performance"])
		// 	}
		// },
		// {
		// 	name: "Charlie Davis",
		// 	sex: "Male",
		// 	zone: "E zone",
		// 	college: "PQR University",
		// 	course: "Biology",
		// 	dateOfBirth: "30/01/2001",
		// 	programs: {
		// 		offStage: chunkArray(["Essay Writing", "Photography"]),
		// 		stage: chunkArray(["Singing"]),
		// 		group: chunkArray(["Drama"])
		// 	}
		// }
	]

  // Filter out users who don't have any event registrations
  const filteredUsers = transformedUsers.filter((user) => user !== null);

  if (filteredUsers.length === 0) {
    return next(new ApiError(404, "No valid registrations found"));
  }

  // const htmlTemplate = fs.readFileSync(
  //   "./src/templates/participant-ticket.html",
  //   "utf-8"
  // );
  // const compiledTemplate = handlebars.compile(htmlTemplate);

  // const browser = await puppeteer.launch({
  //   executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  //   headless: 'new',
  //   args: [
  //       '--no-sandbox',
  //       '--disable-setuid-sandbox',
  //       '--disable-dev-shm-usage'
  //   ]
  // });
  // const pdfDoc = await PDFDocument.create();

  // for (const user of filteredUsers) {
	// 	const noOfPages = Math.max(user.programs?.offStage?.length, user.programs?.stage?.length) || 1;
    
  //   for (const copy of copies) {
	// 		for (let i = 0; i < noOfPages; i++) {
	// 			const page = await browser.newPage();
	// 			const data = {
	// 				...user,
	// 				copy,
	// 				programs: {
	// 					offStage: user.programs?.offStage[i],
	// 					stage: user.programs?.stage[i],
	// 					group: user.programs?.group[i],
	// 				}
	// 			};
	// 			// Populate HTML with user data
	// 			const userHTML = compiledTemplate(data);
	// 			await page.setContent(userHTML);
				
	// 			// Generate the PDF for this user
	// 			const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
	// 			const userPdfDoc = await PDFDocument.load(pdfBuffer);
	// 			const [userPage] = await pdfDoc.copyPages(userPdfDoc, [0]);
	// 			pdfDoc.addPage(userPage);
				
	// 			await page.close();
	// 		}
  //   }
  // }

  // await browser.close();

  // // Serialize the PDFDocument to bytes (a Uint8Array)
  // const combinedPdfBytes = await pdfDoc.save();

  const pdfBytes = await generateParticipantTickets(filteredUsers);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="participant-tickets.pdf"',
  });
  // res.send(Buffer.from(combinedPdfBytes));
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
  }).populate("event");

  if (eventRegistrations.length === 0) {
    return next(new ApiError(404, "No registrations found for the user"));
  }

  const htmlTemplate = fs.readFileSync(
    "./src/templates/participant-ticket.html",
    "utf-8"
  );
  const compiledTemplate = handlebars.compile(htmlTemplate);

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: 'new',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
    ]
  });
  const pdfDoc = await PDFDocument.create();

  const offStageChunks = chunkArray(eventRegistrations
    .filter((reg) => !reg.event.is_onstage)
    .map((reg) => reg.event.name));
  const stageChunks = chunkArray(eventRegistrations
    .filter((reg) => reg.event.is_onstage && !reg.event.is_group)
    .map((reg) => reg.event.name));
  const groupChunks = chunkArray(eventRegistrations
    .filter((reg) => reg.event.is_group)
    .map((reg) => reg.event.name));
  const noOfPages = Math.max(offStageChunks.length, stageChunks.length) || 1;

  for (const copy of copies) {
    for (let i = 0; i < noOfPages; i++) {
      const page = await browser.newPage();

      // Populate HTML with user data
      const userHTML = compiledTemplate({
        regId: user.userId,
        name: user.name.toUpperCase(),
        sex: user.gender,
        zone: "C zone",
        college: user.college,
        course: user.course,
        dateOfBirth: new Date(user.dob).toLocaleDateString(),
        image: user.image,
        programs: {
          offStage: offStageChunks[i],
          stage: stageChunks[i],
          group: groupChunks[i],
        },
        copy,
      });
      await page.setContent(userHTML);

      // Generate the PDF for this user
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      const userPdfDoc = await PDFDocument.load(pdfBuffer);
      const [userPage] = await pdfDoc.copyPages(userPdfDoc, [0]);
      pdfDoc.addPage(userPage);

      await page.close();
    }
  }

  await browser.close();

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const combinedPdfBytes = await pdfDoc.save();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="participant-ticket.pdf"',
  });
  res.send(Buffer.from(combinedPdfBytes));
});

export const pdfExportController = {
  getParticipantTickets,
  getParticipantTicketById
};
