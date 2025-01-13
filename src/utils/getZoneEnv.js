
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

export const getZoneEnv = () => {
    return process.env.ZONE;
};
