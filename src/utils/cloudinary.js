import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINCARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (filePathName)=>{
    try {
        const uploadedResponse = cloudinary.uploader.upload(filePathName, {
            resource_type: "auto"
        })
        console.log(uploadedResponse)
        console.log("File uploaded successfully",uploadedResponse.url)
        return uploadedResponse
    } catch (error) {
        fs.unlinkSync(filePathName)
    }
}

export {uploadToCloudinary}
