import { isValidObjectId } from "mongoose";
import {Like} from "../models/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    // console.log(videoId);

    if(!videoId){
        throw new ApiError(400,"VideoId invalid");
    }

    const isLiked = await Like.exists({
        video: videoId,
        likedBy: req.user?._id
    });

    let message = "";
    if(!isLiked){
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        });
        message = "Video Liked"
    }
    else{
        await Like.findOneAndDelete({
            _id: isLiked._id
        });
        message = "Video Unliked"
    }

    return res.status(200)
    .json(new ApiResponse(200,{},message));
});

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;

    if(!commentId){
        throw new ApiError(400,"CommentId invalid");
    }

    const isLiked = await Like.exists({
        comment: commentId,
        likedBy: req.user._id
    });

    // console.log(isLiked);
    if(!isLiked){
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });
        return res.status(200)
        .json(new ApiResponse(200,{},"Comment Liked"));
    }
    else{
        await Like.findOneAndDelete({
            _id: isLiked?._id
        });
        return res.status(200)
        .json(new ApiResponse(200,{},"Comment Unliked"));
    }
});

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(400,"Tweet Id Invalid");
    }

    const isLiked = await Like.exists({
        likedBy: req.user._id,
        tweet: tweetId
    });

    if(!isLiked){
        await Like.create({
            likedBy: req.user._id,
            tweet: tweetId
        });
        return res.status(200)
        .json(new ApiResponse(200,{},"Tweet Liked"));
    }
    else{
        await Like.findOneAndDelete({
            id: isLiked._id
        });
        return res.status(200)
        .json(new ApiResponse(200,{},"Tweet Unliked"));
    }
});

const getAllLikedVideo = asyncHandler(async(req,res)=>{
    
    const user = req.user;
    const response = await Like.aggregate(
        [
            {
                $match:{
                    comment: null,
                    likedBy: user._id,
                    tweet: null
                }
            },
            {
                $project:{
                    video:1,
                    _id: 0
                }
            }
        ]
    );

    return res.status(200)
    .json(new ApiResponse(200,response,"VideoList returned Successfully"));
});

export  {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideo
}
