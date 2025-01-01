import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

export const generateParticipantTickets = async (users, copies = ["c-zone copy", "student copy"]) => {
	// Create a new PDF document
	const pdfDoc = await PDFDocument.create();

	// Embed the standard fonts
	const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

	// Define common measurements and styles
	const pageWidth = 595.28; // A4 width in points
	const pageHeight = 841.89; // A4 height in points
	const margin = 25;
	const primaryColor = rgb(0.52, 0.45, 0.19); // #857432

	const headerImageFile = fs.readFileSync('./src/templates/participant_ticket_header.png');
	const headerImage = await pdfDoc.embedPng(headerImageFile);
	const { width: headerImageWidth, height: headerImageHeight } = headerImage.scale(0.12);

	const ticketY = pageHeight - margin - headerImageHeight - 12;

	for (const user of users) {
		// Calculate number of pages needed based on program lists
		const noOfPages = Math.max(user.programs?.offStage?.length, user.programs?.stage?.length) || 1;

		for (const copy of copies) {
			for (let pageIndex = 0; pageIndex < noOfPages; pageIndex++) {
				const page = pdfDoc.addPage([pageWidth, pageHeight]);

				// Header Image
				page.drawImage(headerImage, {
					x: pageWidth / 2 - headerImageWidth / 2,
					y: pageHeight - margin + 10 - headerImageHeight,
					width: headerImageWidth,
					height: headerImageHeight
				});

				// Header text
				page.drawText(`(${copy})`, {
					x: pageWidth / 2 - 50,
					y: pageHeight - margin - headerImageHeight - 3,
					size: 14
				});

				// Draw main ticket container
				page.drawRectangle({
					x: margin,
					y: ticketY - 400,
					width: pageWidth - 2 * margin,
					height: 400,
					borderColor: rgb(0, 0, 0),
					borderWidth: 1
				});

				// Personal Details Section
				const detailsStartX = margin + 160; // After photo space
				const detailsStartY = ticketY - 10;

				// Photo placeholder
				page.drawRectangle({
					x: margin + 10,
					y: ticketY - 154,
					width: 140,
					height: 144,
					borderColor: rgb(0, 0, 0),
					borderWidth: 1
				});

				// Draw personal details
				const fieldHeight = 24;
				const drawField = (label, value, x, y, width) => {
					const labelWidth = helveticaBold.widthOfTextAtSize(label, 14);
					
					page.drawRectangle({
						x,
						y: y - fieldHeight,
						width,
						height: fieldHeight,
						borderColor: rgb(0, 0, 0),
						borderWidth: 1
					});

					page.drawText(label, {
						x: x + 5,
						y: y - 15,
						font: helveticaBold,
						size: 14
					});


					page.drawText(value || '', {
						x: x + 10 + labelWidth,
						y: y - 15,
						font: helvetica,
						size: 14
					});
				};
				const drawFieldWithTwoLines = (label, value, x, y, width) => {
					page.drawRectangle({
						x,
						y: y - 2 * fieldHeight,
						width,
						height: 2 * fieldHeight,
						borderColor: rgb(0, 0, 0),
						borderWidth: 1
					});
					
					page.drawText(label, {
						x: x + 5,
						y: y - 17,
						font: helveticaBold,
						size: 14
					});

					page.drawText(value || '', {
						x: x + 5,
						y: y - 35,
						font: helvetica,
						size: 14
					});
				};

				// Draw all personal details fields
				const detailsWidth = pageWidth - detailsStartX - margin - 10;
				drawField('Name:', user.name, detailsStartX, detailsStartY, detailsWidth);
				drawField('Reg ID:', user.regId, detailsStartX, detailsStartY - fieldHeight, detailsWidth / 2);
				drawField('Sex:', user.sex, detailsStartX + detailsWidth / 2, detailsStartY - fieldHeight, detailsWidth / 2);
				drawFieldWithTwoLines('College:', user.college, detailsStartX, detailsStartY - 2 * fieldHeight, detailsWidth);
				drawField('Course:', user.course, detailsStartX, detailsStartY - 4*fieldHeight, detailsWidth);
				drawField('Date of Birth:', user.dateOfBirth, detailsStartX, detailsStartY - 5*fieldHeight, detailsWidth);

				// Programs Section
				const programsY = ticketY - 200;
				const programWidth = (pageWidth - 2 * margin - 20) / 3;

				// Function to draw program section
				const drawProgramSection = (title, programs, x, y) => {
					// Header
					page.drawRectangle({
						x,
						y,
						width: programWidth,
						height: 25,
						color: primaryColor
					});

					page.drawText(title, {
						x: x + programWidth / 2 - 20,
						y: y + 8,
						font: helveticaBold,
						size: 12,
						color: rgb(1, 1, 1)
					});

					// Content area
					page.drawRectangle({
						x,
						y: y - 180,
						width: programWidth,
						height: 180,
						borderColor: rgb(0, 0, 0),
						borderWidth: 1
					});

					// Draw programs
					const currentPrograms = programs?.[pageIndex] || [];
					currentPrograms.forEach((program, index) => {
						page.drawText(program, {
							x: x + 5,
							y: y - 20 - (index * 15),
							font: helvetica,
							size: 10
						});
					});
				};

				// Draw all program sections
				drawProgramSection('Off Stage', user.programs.offStage, margin, programsY);
				drawProgramSection('Stage', user.programs.stage, margin + programWidth + 10, programsY);
				drawProgramSection('Group', user.programs.group, margin + 2 * (programWidth + 10), programsY);

				// Signature section
				const signatureY = ticketY - 500;
				page.drawText('Principal Signature & Seal', {
					x: margin + 50,
					y: signatureY,
					font: helvetica,
					size: 12
				});

				page.drawText('UUC', {
					x: pageWidth - margin - 100,
					y: signatureY,
					font: helvetica,
					size: 12
				});

				// Footer notes
				const footerY = margin + 50;
				page.drawText('Notes:', {
					x: margin,
					y: footerY,
					font: helveticaBold,
					size: 12
				});

				page.drawText('• Participants should bring their college ID card.', {
					x: margin,
					y: footerY - 20,
					font: helvetica,
					size: 10
				});

				page.drawText('• Participants should report at the venue 30 minutes before the event.', {
					x: margin,
					y: footerY - 40,
					font: helvetica,
					size: 10
				});
			}
		}
	}

	return await pdfDoc.save();
};