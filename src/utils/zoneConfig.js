import { rgb } from 'pdf-lib';

export const getZoneConfig = (zone) => {
    
    switch (zone.toLowerCase()) {
      case 'c':
        return {
          primaryColor: rgb(0.52, 0.45, 0.19), 
          headerImagePath: './src/templates/zone_a_participant_ticket_header.png'
        };
      case 'b':
        return {
          primaryColor: rgb(0.19, 0.45, 0.52), 
          headerImagePath: './src/templates/zone_b_participant_ticket_header.png'
        };
      default:
        return null;
    }
};
