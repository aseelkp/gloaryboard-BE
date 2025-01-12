import { rgb } from 'pdf-lib';
export const getZoneConfig = (zone) => {
    
    switch (zone.toLowerCase()) {
      case 'a':
        return {
          primaryColor: rgb(0.69, 0.18, 0.51), 
          headerImagePath: './src/templates/zone_a_participant_ticket_header.png',
          footerText: ["Kindly submit the A-zone copy along with the following documents to the Program Office on or before 20th January.", "A copy of your SSLC Book.", "A copy of your Hall Ticket."],
          DB_NAME: "A-Zone",
        };
      case 'c':
        return {
          primaryColor: rgb(0.52, 0.45, 0.19), 
          headerImagePath: './src/templates/zone_c_participant_ticket_header.png',
          footerText: ["Kindly submit the C-zone copy along with the following documents to the Program Office on or before 13th January.", "A copy of your SSLC Book.", "A copy of your Hall Ticket."],
          DB_NAME: "C-Zone",
        };
      case 'd':
        return {
          primaryColor: rgb(0.19, 0.45, 0.52), 
          headerImagePath: './src/templates/zone_d_participant_ticket_header.png',
          footerText: ["Kindly submit the D-zone copy along with the following documents to the Program Office on or before 13th January.", "A copy of your SSLC Book.", "A copy of your Hall Ticket."],
          DB_NAME: "D-Zone",
        };
      default:
        return null;
    }
};
