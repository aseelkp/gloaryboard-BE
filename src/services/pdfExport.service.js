import { PDFDocument, rgb, StandardFonts, layoutSinglelineText } from "pdf-lib";
import fs from "fs";
import { zone } from "../constants.js";
import { getZoneConfig } from "../utils/zoneConfig.js";

// Utility function to sanitize text fields
const sanitizeText = (text) => text.replace(/\t/g, " ");

export const generateParticipantTickets = async (users) => {
  try {
    const copies = [`${zone.toLocaleUpperCase()}-Zone Copy`, "Student Copy"];
    const { primaryColor, headerImagePath, footerText } = getZoneConfig(zone);
    if (!primaryColor || !headerImagePath) {
      throw new Error("Zone configuration not found");
    }

    const pdfDoc = await PDFDocument.create();

    // Embed the standard fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Define common measurements and styles
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 25;

    const headerImageFile = fs.readFileSync(headerImagePath);
    const headerImage = await pdfDoc.embedPng(headerImageFile);
    const { width: headerImageWidth, height: headerImageHeight } =
      headerImage.scaleToFit(pageWidth - 2 * margin - 20, 150);

    const ticketY = pageHeight - margin - headerImageHeight - 37;

    for (const user of users) {
      console.log(user.course , user.regId);
      let image;
      if (user.image) {
        if (user.image.endsWith(".png")) {
          const pngImageBytes = await fetch(user.image).then((res) =>
            res.arrayBuffer()
          );
          image = await pdfDoc.embedPng(pngImageBytes);
        } else if (
          user.image.endsWith(".jpg") ||
          user.image.endsWith(".jpeg")
        ) {
          const jpgImageBytes = await fetch(user.image).then((res) =>
            res.arrayBuffer()
          );
          image = await pdfDoc.embedJpg(jpgImageBytes);
        } else {
          throw new Error("Unsupported image format");
        }
      } else {
        image = null;
      }

      for (const copy of copies) {
        let nextPage = false;
        const offStagePrograms = [...user.programs.offStage];
        const stagePrograms = [...user.programs.stage];
        const groupPrograms = [...user.programs.group];
        do {
          nextPage = false;
          const page = pdfDoc.addPage([pageWidth, pageHeight]);

          // Header Image
          page.drawImage(headerImage, {
            x: pageWidth / 2 - headerImageWidth / 2,
            y: pageHeight - margin + 10 - headerImageHeight,
            width: headerImageWidth,
            height: headerImageHeight,
          });

					// Participant Ticket Header
					const ticketHeadingY = pageHeight - margin - headerImageHeight - 12;
					page.drawRectangle({
						x: 133,
						y: ticketHeadingY,
						width: 326,
						height: 25,
						color: primaryColor,
					})
					page.drawText("Zone Festival", {
						x: 143,
						y: ticketHeadingY + 7,
						font: helveticaBold,
						size: 16,
						color: rgb(1, 1, 1),
					})
					page.drawRectangle({
						x: 256,
						y: ticketHeadingY + 3,
						width: 200,
						height: 19,
						color: rgb(1, 1, 1),
					})
					page.drawText("PARTICIPANT'S TICKET", {
						x: 265,
						y: ticketHeadingY + 7,
						font: helveticaBold,
						size: 16,
					})

          // Header text
          page.drawText(`( ${copy} )`, {
            x: pageWidth / 2 - 50,
            y: ticketHeadingY - 15,
            size: 12,
          });

          // Draw main ticket container
          page.drawRectangle({
            x: margin,
            y: ticketY - 455,
            width: pageWidth - 2 * margin,
            height: 455,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
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
              height: 144,
            });
          }

          // Draw personal details
          const fieldHeight = 24;
          const drawField = (
            label,
            value,
            x,
            y,
            width,
            containerHeight = fieldHeight
          ) => {
            const labelWidth = helveticaBold.widthOfTextAtSize(label, 14);

            page.drawRectangle({
              x,
              y: y - containerHeight,
              width,
              height: containerHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });

            page.drawText(label, {
              x: x + 5,
              y: y - 17,
              font: helveticaBold,
              size: 14,
            });

            page.drawText(sanitizeText(value) || "", {
              x: x + 10 + labelWidth,
              y: y - 17,
              font: helvetica,
              size: 14,
              maxWidth: width - labelWidth - 15,
              lineHeight: 20,
            });
          };

          const drawDynamicSizeField = (
            label,
            value,
            x,
            y,
            width,
            containerHeight = fieldHeight
          ) => {
            const labelWidth = helveticaBold.widthOfTextAtSize(label, 14);
            const valueWidth = helvetica.widthOfTextAtSize(value, 14);
            let valueFontSize = 14;
            const availableWidth = width - labelWidth - 15;

            if (valueWidth > availableWidth) {
              const { fontSize } = layoutSinglelineText(value, {
                font: helvetica,
                bounds: {
                  width: availableWidth,
                },
              });
              valueFontSize = fontSize;
            }

            page.drawRectangle({
              x,
              y: y - containerHeight,
              width,
              height: containerHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });

            page.drawText(label, {
              x: x + 5,
              y: y - 17,
              font: helveticaBold,
              size: 14,
            });

            page.drawText(sanitizeText(value) || "", {
              x: x + 10 + labelWidth,
              y: y - 17,
              font: helvetica,
              size: valueFontSize,
              maxWidth: availableWidth,
              lineHeight: 20,
            });
          };

          // Draw all personal details fields
          const detailsWidth = pageWidth - detailsStartX - margin - 10;
          drawDynamicSizeField(
            "Name:",
            user.name,
            detailsStartX,
            detailsStartY,
            detailsWidth
          );
          drawField(
            "Reg ID:",
            user.regId,
            detailsStartX,
            detailsStartY - fieldHeight,
            detailsWidth / 2
          );
          drawField(
            "Sex:",
            user.sex,
            detailsStartX + detailsWidth / 2,
            detailsStartY - fieldHeight,
            detailsWidth / 2
          );
          drawField(
            "College:",
            user.college,
            detailsStartX,
            detailsStartY - 2 * fieldHeight,
            detailsWidth,
            2 * fieldHeight
          );
          drawDynamicSizeField(
            "Course:",
            sanitizeText(user.course),
            detailsStartX,
            detailsStartY - 4 * fieldHeight,
            detailsWidth
          );
          drawField(
            "Semester:",
            user.semester,
            detailsStartX,
            detailsStartY - 5 * fieldHeight,
            detailsWidth / 2
          );
          drawField(
            "Date of Birth:",
            user.dateOfBirth,
            detailsStartX + detailsWidth / 2,
            detailsStartY - 5 * fieldHeight,
            detailsWidth / 2
          );

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
              color: primaryColor,
            });

            const titleWidth = helveticaBold.widthOfTextAtSize(title, 12);
            page.drawText(title, {
              x: x + programWidth / 2 - titleWidth / 2,
              y: y + 8,
              font: helveticaBold,
              size: 12,
              color: rgb(1, 1, 1),
            });

            // Content area
            page.drawRectangle({
              x,
              y: y - 260,
              width: programWidth,
              height: 285,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });

            // Draw programs
            let totalLines = 0;
            let pageBreakTriggered = false;
            page.moveTo(x, y - 15);

            programs.forEach((program, index) => {
              if (pageBreakTriggered) return;

              const programText = `• ${program}`;
              const words = programText.split(" ");
              const fontSize = 10;
              const availableWidth = programWidth - 10;
              let currentLine = "";
              let lineCount = 1;

              // Simulate text wrapping to count lines
              words.forEach((word) => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = helvetica.widthOfTextAtSize(
                  testLine,
                  fontSize
                );
                if (testWidth > availableWidth) {
                  currentLine = word;
                  lineCount++;
                } else {
                  currentLine = testLine;
                }
              });

              totalLines += lineCount;

              if (totalLines > 15) {
                nextPage = true;
                pageBreakTriggered = true;
                programs.splice(0, index);
                return;
              } else if (index === programs.length - 1) {
                programs.splice(0, index + 1);
              }

              page.drawText(sanitizeText(programText), {
                x: x + 5,
                font: helvetica,
                size: fontSize,
                lineHeight: 14.5,
                maxWidth: availableWidth,
              });
              page.moveDown(lineCount * 14.5 + 2);
            });
          };

          // Draw all program sections
          drawProgramSection(
            "Off Stage",
            offStagePrograms.map(sanitizeText),
            margin + 5,
            programsY
          );
          drawProgramSection(
            "Stage",
            stagePrograms.map(sanitizeText),
            margin + programWidth + 10,
            programsY
          );
          drawProgramSection(
            "Group",
            groupPrograms.map(sanitizeText),
            margin + 2 * programWidth + 15,
            programsY
          );

          // Signature section
          const signatureY = ticketY - 540;
          page.drawText("Principal Signature & Seal", {
            x: margin + 5,
            y: signatureY,
            font: helvetica,
            size: 12,
          });

          if (copy === "Student Copy") {
            page.drawText("University Union Councillor (UUC)", {
              x: pageWidth / 2 - 90,
              y: signatureY,
              font: helvetica,
              size: 12,
            });

            page.drawText(`${zone.toLocaleUpperCase()}-Zone General Convenor`, {
              x: pageWidth - margin - 145,
              y: signatureY,
              font: helvetica,
              size: 12,
            });
            page.drawText(`(For ${zone.toLocaleUpperCase()}-zone office use)`, {
              x: pageWidth - margin - 125,
              y: signatureY - 13,
              font: helvetica,
              size: 10,
            });
          } else {
            page.drawText("University Union Councillor (UUC)", {
              x: pageWidth - margin - 186,
              y: signatureY,
              font: helvetica,
              size: 12,
            });
          }

		  if (footerText) {
				// Footer notes
				const footerY = margin + 45;
				page.drawText("Notes:", {
					x: margin,
					y: footerY,
					font: helveticaBold,
					size: 12,
				});
				page.moveTo(margin, footerY - 15);

				footerText.forEach((note) => {
					page.drawText(`• ${sanitizeText(note)}`, {
						x: margin,
						font: helvetica,
						size: 10,
					});
					page.moveDown(15);
				});
		  }
        } while (nextPage);
        // }
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    throw error;
  }
};
