import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

export const generateParticipantTickets = async (users, copies = ["C-Zone Copy", "Student Copy"]) => {
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
		let image;
		if (user.image) {
			console.log(user.image);

			if (user.image.endsWith('.png')) {
				const pngImageBytes = await fetch(user.image).then((res) => res.arrayBuffer());
				image = await pdfDoc.embedPng(pngImageBytes);
			} else if (user.image.endsWith('.jpg') || user.image.endsWith('.jpeg')) {
				const jpgImageBytes = await fetch(user.image).then((res) => res.arrayBuffer());
				image = await pdfDoc.embedJpg(jpgImageBytes);
			} else {
				throw new Error('Unsupported image format');
			}
		} else {
			image = null;
		}

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
				page.drawText(`( ${copy} )`, {
					x: pageWidth / 2 - 50,
					y: pageHeight - margin - headerImageHeight - 3,
					size: 14
				});

				// Draw main ticket container
				page.drawRectangle({
					x: margin,
					y: ticketY - 445,
					width: pageWidth - 2 * margin,
					height: 445,
					borderColor: rgb(0, 0, 0),
					borderWidth: 1
				});

				// Personal Details Section
				const detailsStartX = margin + 135.2; // After photo space
				const detailsStartY = ticketY - 10;

				// Draw photo
				if (image) {
					page.drawImage(image, {
						x: margin + 10,
						y: ticketY - 154,
						width: 115.2,
						height: 144
					});
				}

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
				drawField('Course:', user.course, detailsStartX, detailsStartY - 4 * fieldHeight, detailsWidth);
				drawField('Semester:', user.semester, detailsStartX, detailsStartY - 5 * fieldHeight, detailsWidth / 2);
				drawField('Date of Birth:', user.dateOfBirth, detailsStartX + detailsWidth / 2, detailsStartY - 5 * fieldHeight, detailsWidth / 2);

				// Programs Section
				const programsY = ticketY - 190;
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

					const titleWidth = helveticaBold.widthOfTextAtSize(title, 12);
					page.drawText(title, {
						x: x + programWidth / 2 - titleWidth / 2,
						y: y + 8,
						font: helveticaBold,
						size: 12,
						color: rgb(1, 1, 1)
					});

					// Content area
					page.drawRectangle({
						x,
						y: y - 250,
						width: programWidth,
						height: 275,
						borderColor: rgb(0, 0, 0),
						borderWidth: 1
					});

					// Draw programs
					const currentPrograms = programs?.[pageIndex] || [];
					currentPrograms.forEach((program, index) => {
						page.drawText(program, {
							x: x + 5,
							y: y - 15 - (index * 17),
							font: helvetica,
							size: 12
						});
					});
				};

				// Draw all program sections
				drawProgramSection('Off Stage', user.programs.offStage, margin + 5, programsY);
				drawProgramSection('Stage', user.programs.stage, margin + programWidth + 10, programsY);
				drawProgramSection('Group', user.programs.group, margin + 2 * (programWidth) + 15, programsY);

				// Signature section
				const signatureY = ticketY - 535;
				page.drawText('Principal Signature & Seal', {
					x: margin + 5,
					y: signatureY,
					font: helvetica,
					size: 12
				});

				page.drawText('University Union Councillor (UUC)', {
					x: pageWidth - margin - 186,
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

				page.drawText('• Kindly submit the C-Zone copy along with the following documents to the Program Office on or before the 13th January:', {
					x: margin,
					y: footerY - 20,
					maxWidth: pageWidth - 2 * margin,
					font: helvetica,
					size: 10
				});

				page.drawText('• A copy of your SSLC Book.', {
					x: margin,
					y: footerY - 35,
					font: helvetica,
					size: 10
				});
			}
		}
	}

	return await pdfDoc.save();
};