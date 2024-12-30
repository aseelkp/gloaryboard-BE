import fs from "fs";
import handlebars from "handlebars";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { EventRegistration } from "../models/eventRegistration.models.js";

const getParticipantTickets = asyncHandler(async (req, res, next) => {
  const collegeName = req.user.name;

  // Fetch users from the specified college
  const users = await User.find({ college: collegeName });
  if (!users || users.length === 0) {
    throw new ApiError(404, "No users found for the specified college");
  }

  // Fetch related data from the EventRegistration collection for each user
  const transformedUsers = await Promise.all(
    users.map(async (user) => {
      const eventRegistrations = await EventRegistration.find({
        "participants.user": user._id,
      }).populate("event");

      return {
        regId: user.userId,
        name: user.name.toUpperCase(),
        sex: user.gender,
        zone: "C zone",
        college: user.college,
        course: user.course,
        dateOfBirth: new Date(user.dob).toLocaleDateString(),
        image: user.image,
        programs: {
          offStage: eventRegistrations
            .filter((reg) => !reg.event.is_onstage)
            .map((reg) => reg.event.name),
          stage: eventRegistrations
            .filter((reg) => reg.event.is_onstage && !reg.event.is_group)
            .map((reg) => reg.event.name),
          group: eventRegistrations
            .filter((reg) => reg.event.is_group)
            .map((reg) => reg.event.name),
        },
      };
    })
  );

  const htmlTemplate = fs.readFileSync(
    "./src/templates/participant-ticket.html",
    "utf-8"
  );
  const compiledTemplate = handlebars.compile(htmlTemplate);

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 30000,
  });
  const pdfDoc = await PDFDocument.create();
  const copies = ["c-zone copy", "student copy"];

  for (const user of transformedUsers) {
    for (const copy of copies) {
      const page = await browser.newPage();

      // Populate HTML with user data
      const userHTML = compiledTemplate({ ...user, copy });
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
    "Content-Disposition": 'attachment; filename="participant-tickets.pdf"',
  });
  res.send(Buffer.from(combinedPdfBytes));
});

export const pdfExportController = {
  getParticipantTickets,
};
