import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadToCloudinary = async (localFilePath,destinationFolder) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: destinationFolder
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        // console.log(response)
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteImageFromCloudinary = async(public_id,sourceFolder)=>{

    try{
        if(!public_id)return null;
        const response = await cloudinary.uploader.destroy(public_id,{
            resource_type: "image",
            invalidate: true,
            folder: sourceFolder
        });
        // console.log(response);
        return response;
    }
    catch(error){
        console.log(error);
        return null;
    }
}

const deleteVideoFromCloudinary = async(public_id,sourceFolder)=>{
    try{
        if(!public_id)return null;
        const response = await cloudinary.uploader.destroy(public_id,{
            resource_type: "video",
            invalidate: true,
            folder: sourceFolder
        });
        // console.log(response);
        return response;
    }
    catch(error){
        console.log(error);
        return null;
    }
}

export {uploadToCloudinary,deleteImageFromCloudinary,deleteVideoFromCloudinary}
