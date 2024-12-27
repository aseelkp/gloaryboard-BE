import fs from "fs";
import handlebars from "handlebars";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";
import { asyncHandler } from "../utils/asyncHandler.js";

const getParticipantTickets = asyncHandler(async (req, res, next) => {
	const users = [
		{
			name: "John Doe",
			sex: "Male",
			zone: "C zone",
			college: "EMEA College of Arts and Science, Kondotty",
			course: "Computer Science",
			dateOfBirth: "21/11/2005",
			programs: {
				offStage: ["Quiz", "Essay Writing", "Pencil Drawing"],
				stage: ["Solo Dance", "Mappilappattu", "Singing"],
				group: ["Group Dance", "Drama", "Duff Muttu"]
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
				offStage: ["Debate", "Poetry"],
				group: ["Choir", "Theater"]
			}
		},
		{
			name: "Alice Johnson",
			sex: "Female",
			zone: "B zone",
			college: "XYZ College",
			course: "Physics",
			dateOfBirth: "10/12/2003",
			programs: {
				offStage: ["Painting", "Essay Writing"],
				stage: ["Drama"],
			}
		},
		{
			name: "Bob Brown",
			sex: "Male",
			zone: "D zone",
			college: "LMN Institute",
			course: "Chemistry",
			dateOfBirth: "22/08/2002",
			programs: {
				stage: ["Solo Dance"],
				group: ["Band Performance"]
			}
		},
		{
			name: "Charlie Davis",
			sex: "Male",
			zone: "E zone",
			college: "PQR University",
			course: "Biology",
			dateOfBirth: "30/01/2001",
			programs: {
				offStage: ["Essay Writing", "Photography"],
				stage: ["Singing"],
				group: ["Drama"]
			}
		},
		{
			name: "Diana Evans",
			sex: "Female",
			zone: "F zone",
			college: "STU College",
			course: "History",
			dateOfBirth: "05/03/2000",
			programs: {
				offStage: ["Poetry", "Painting"],
				stage: ["Speech"],
				group: ["Choir"]
			}
		},
		{
			name: "Ethan Foster",
			sex: "Male",
			zone: "G zone",
			college: "VWX Institute",
			course: "Geography",
			dateOfBirth: "12/07/1999",
			programs: {
				offStage: ["Debate"],
				stage: ["Drama"],
				group: ["Group Dance"]
			}
		},
		{
			name: "Fiona Green",
			sex: "Female",
			zone: "H zone",
			college: "YZA University",
			course: "Philosophy",
			dateOfBirth: "18/09/1998",
			programs: {
				offStage: ["Essay Writing", "Quiz"],
				stage: ["Solo Dance"],
				group: ["Band Performance"]
			}
		},
		{
			name: "George Harris",
			sex: "Male",
			zone: "I zone",
			college: "BCD College",
			course: "Political Science",
			dateOfBirth: "25/11/1997",
			programs: {
				offStage: ["Photography"],
				stage: ["Singing"],
				group: ["Drama"]
			}
		},
		{
			name: "Hannah Jackson",
			sex: "Female",
			zone: "J zone",
			college: "EFG Institute",
			course: "Economics",
			dateOfBirth: "03/02/1996",
			programs: {
				offStage: ["Poetry", "Painting"],
				stage: ["Speech"],
				group: ["Choir"]
			}
		}
	]
	
    const htmlTemplate = fs.readFileSync('./src/templates/participant-ticket.html', 'utf-8');
    const compiledTemplate = handlebars.compile(htmlTemplate);

	const browser = await puppeteer.launch();
    const pdfDoc = await PDFDocument.create();

    for (const user of users) {
        const page = await browser.newPage();

        // Populate HTML with user data
        const userHTML = compiledTemplate(user);
        await page.setContent(userHTML);

        // Generate the PDF for this user
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        const userPdfDoc = await PDFDocument.load(pdfBuffer);
        const [userPage] = await pdfDoc.copyPages(userPdfDoc, [0]);
        pdfDoc.addPage(userPage);

        await page.close();
    }

    await browser.close();

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const combinedPdfBytes = await pdfDoc.save();

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="participant-tickets.pdf"',
    });
    res.send(Buffer.from(combinedPdfBytes));
});

export const pdfExportController = {
	getParticipantTickets
};