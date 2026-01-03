import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded on Cloudinary:" +  response.url);

    // delete local file AFTER successful upload (non-blocking)
    fs.unlink(localFilePath, (err) => {
      if (err) console.warn("Local file delete failed:", err.message);
    });

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);

    // attempt cleanup if file exists
    fs.access(localFilePath, fs.constants.F_OK, (err) => {
      if (!err) fs.unlink(localFilePath, () => {});
    });

    throw error; // IMPORTANT: don't silently return null
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary:", publicId);

    return response;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error.message);
    return null;
  }
};

export { cloudinary, uploadOnCloudinary, deleteFromCloudinary };
