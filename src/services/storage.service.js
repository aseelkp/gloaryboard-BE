import fs from "fs";
import dotenv from "dotenv";
import  AWS  from "aws-sdk";

dotenv.config();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

const uploadToSpace = async (fileName , fileLocalPath , userId) => {
    if (!fileLocalPath) return null;

    const file = fs.readFileSync(fileLocalPath);
    const params = {
        Bucket: process.env.DO_SPACES_NAME,
        Key: `user-profile/${userId}_${Date.now()}_${fileName}`,
        Body: file,
        ACL: "public-read",
    };
    try {
        const data = await s3.upload(params).promise();
        console.warn(`File uploaded successfully. ${data.Location}`);
        fs.unlinkSync(fileLocalPath);
        return data.Location;
    } catch (error) {
        console.log(`Failed to upload file. ${error}`);
        fs.unlinkSync(fileLocalPath);
        throw new Error("Failed to upload file");
    }
}

const deleteFromSpace = async (key) => {
    if (!key) return null;

    const params = {
        Bucket: process.env.DO_SPACES_NAME,
        Key: key,
    };
    try {
        await s3.deleteObject(params).promise();
        return;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to delete file");
    }
}

export const storageService = {
    uploadToSpace,
    deleteFromSpace,
}