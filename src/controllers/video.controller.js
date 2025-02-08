import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteImageFromCloudinary, deleteVideoFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { isEmpty } from "../utils/validations.js";

//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async(req,res)=>{
    const { page=1,limit=10,query,sortBy,sortType,userId } = req.query;
    
})

//video upload(contains video && thumbnail from multer), title, description, duration from cloudinary response
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

    const _video = await uploadToCloudinary(videoFileLocalPath,process.env.VIDEO_CLOUDINARY_PATH);
    const _thumbnail = await uploadToCloudinary(thumbnailLocalPath,process.env.THUMBNAIL_CLOUDINARY_PATH);

    if(!_video)throw new ApiError(400,"video not uploaded to cloudinary");
    if(!_thumbnail)throw new ApiError(400,"thumbnail not uploaded to cloudinary");

    // console.log(_video);
    // console.log(_thumbnail)
    const video = await Video.create({
        title,
        description,
        videoFile: [_video.url,_video.public_id],
        thumbnail: [_thumbnail.url,_thumbnail.public_id],
        duration: _video.duration,
        views: 0,
        isPublished: true,
        owner: user
    });

    if(!video)throw new ApiError(400,"Something Went wrong");

    return res.status(200)
    .json(new ApiResponse(200,video,"video published successfully"));
})
//delete video from cloudinary, from database 
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);

    if(!video)throw new ApiError(401,"video not found");

    let isVideoDeleted,isThumbnailDeleted;
    isVideoDeleted = await deleteVideoFromCloudinary(video.videoFile[1],process.env.VIDEO_CLOUDINARY_PATH);
    if(!isVideoDeleted || isVideoDeleted.result !== "ok")throw new ApiError(402,"Video not deleted from cloudinary");

    isThumbnailDeleted = await deleteImageFromCloudinary(video.thumbnail[1],process.env.THUMBNAIL_CLOUDINARY_PATH);
    if(!isThumbnailDeleted || isThumbnailDeleted.result !== "ok")throw new ApiError(402,"Thumbnail not deleted from cloudinary");
    
    await Video.deleteOne({_id: videoId});

    return res.status(200)
    .json(new ApiResponse(200,{},"Video & Thumbnail deleted"));
});

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    // console.log(typeof(videoId));
    const video = await Video.findById(videoId);

    if(!video)throw new ApiError(401,"Video not found");

    // console.log(video);
    return res.status(200)
    .json(new ApiResponse(200,video,"Video found"));
})
//make video private(toogle publish status)
const tooglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;

    if(!videoId)throw new ApiError(400,"VideoId Not Found");
    const video = await Video.findOneAndUpdate(
        {
            _id:videoId
        },
        [
            {
                $set:{
                    isPublished:{
                        $not: "$isPublished"
                    }
                }
            }
        ],
        {new: true}
    );

    if(!video)throw new ApiError(400,"Video Not Found");
    return res.status(200)
    .json(new ApiResponse(200,video,"Video status is changed"));
})
//update details- title, description, thumbnail, 
const updateDetails = asyncHandler(async(req,res)=>{
    const {videoId}= req.params;
    if(!videoId)throw new ApiError(400,"Video id not found");

    const video = await Video.findOne(
        {_id : videoId}
    );

    if(!video)throw new ApiError(400,"Video no found");

    const {title, description} = req.body;
    const thumbnailLocalPath = req.file?.path;
    let thumbnail = null;
    if(thumbnailLocalPath){
        thumbnail = await uploadToCloudinary(thumbnailLocalPath,process.env.THUMBNAIL_CLOUDINARY_PATH);
        if(!thumbnail)throw new ApiError(400,"Thumbnail upload failed");
        await deleteImageFromCloudinary(video.thumbnail[1],process.env.THUMBNAIL_CLOUDINARY_PATH);
    }

    if(title)video.title = title;
    if(description)video.description = description;
    if(thumbnail)video.thumbnail = [thumbnail.url,thumbnail.public_id];

    await video.save();
    
    
    // const video = await Video.findOneAndUpdate(
    //     {
    //         _id: videoId
    //     },
    //     [
    //         {
    //             $set:{
    //                 title: title?.trim() || "$title",
    //                 description: description?.trim() || "$description",
    //                 thumbnail: [thumbnailCloudinaryPath?.url,thumbnailCloudinaryPath?.public_id] || "$thumbnail"
    //             }
    //         }
    //     ],
    //     {
    //         new:true
    //     }
    // )
    return res.status(200)
    .json(new ApiResponse(200,video,"Fields updated"));
})

export {
    publishAVideo,
    getVideoById,
    deleteVideo,
    tooglePublishStatus,
    updateDetails
}