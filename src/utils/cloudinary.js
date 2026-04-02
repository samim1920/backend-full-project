import dotenv from "dotenv"
dotenv.config()


import { v2 as cloudinary } from 'cloudinary';

import fs from "fs";


    console.log(process.env.CLOUDINARY_API_KEY)

  cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

   

const uploadcloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) {
            return null;
        }

        const uploadResult = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        console.log("File is uploaded in cloudinary", uploadResult.url);
        fs.unlinkSync(localfilepath)
        return uploadResult;

    } catch (error) {
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath); // remove local file safely
        }
        console.error("Upload failed:", error);
        return null;
    }
};

export {uploadcloudinary}
