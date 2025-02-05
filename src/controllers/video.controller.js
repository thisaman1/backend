import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { isEmpty } from "../utils/validations.js";

//video upload(contains video && thumbnail from multer), title, description, duration from cloudinary response
//
const publishAVideo = asyncHandler(async (req,res)=>{
    if(!req.files || !req.files.videoFile || !req.files.thumbnail){
        throw new ApiError(400,"Video and thumbnail is required");
    }

    const {title, description} = req.body;

    if(isEmpty(title))throw new ApiError(400,"Title is required");
    if(isEmpty(description))throw new ApiError(400,"Description is required");

    const user = req.user;
    let videoFileLocalPath,thumbnailLocalPath;
    if(req.files){
        if(Array.isArray(req.files.videoFile) && req.files.videoFile.length>0){
            videoFileLocalPath = req.files.videoFile[0].path;
        }
        if(Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
            thumbnailLocalPath = req.files.thumbnail[0].path;
        }
    }

    if(!videoFileLocalPath)throw new ApiError(400,"VideoFile is required");
    if(!thumbnailLocalPath)throw new ApiError(400,"Thumbnail is required");

    const _video = await uploadToCloudinary(videoFileLocalPath);
    const _thumbnail = await uploadToCloudinary(thumbnailLocalPath);

    if(!_video)throw new ApiError(400,"video not uploaded to cloudinary");
    if(!_thumbnail)throw new ApiError(400,"thumbnail not uploaded to cloudinary");

    const video = await Video.create({
        title,
        description,
        videoFile: _video.url,
        thumbnail: _thumbnail.url,
        duration: _video.duration,
        views: 0,
        isPublished: true,
        owner: user
    })

    if(!video)throw new ApiError(400,"Something Went wrong");

    return res.status(200)
    .json(new ApiResponse(200,video,"video published successfully"));
})

//delete video

//make video private(toogle publish status)

//update details- title, description, thumbnail, 

//get video (need video_id, )




export {
    publishAVideo
}