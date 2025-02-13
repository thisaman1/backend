import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import {ObjectId } from "mongoose";
import mongoose from "mongoose";

const commentOnVideo = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"No content in comment");
    }
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400,"VideoId invalid");
    }

    const video = await Video.findOne({_id: videoId});

    if(!video){
        throw new ApiError(400,"Video Not found");
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id
    });

    return res.status(200)
    .json(new ApiResponse(200,comment,"Comment added"));
});

const updateComment = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Content is Empty");
    }
    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(401,"CommentId invalid");
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:content
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
    .json(new ApiResponse(200,comment,"Comment Updated"));
});

const commentOnComment = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Empty Content");
    }

    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(400,"CommentId invalid");
    }

    const comment = await Comment.create({
        content: content,
        comment: commentId,
        owner:req.user._id
    })

    return res.status(200)
    .json(new ApiResponse(200,comment,"Reply added"));
});

const commentOnTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Empty Content");
    }

    const {tweetId} = req.params;
    if(!tweetId){
        throw new ApiError(400,"tweetId invalid");
    }

    const comment = await Comment.create({
        content:content,
        tweet: tweetId,
        owner: req.user._id
    });

    return res.status(200)
    .json(new ApiResponse(200,comment,"Comment added"));
});

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.query;

    if(!commentId){
        throw new ApiError(400,"CommentId invalid");
    }

    await Comment.findOneAndDelete(
        {
            _id: new mongoose.Types.ObjectId(commentId)
        }
    );

    return res.status(200)
    .json(new ApiResponse(200,{},"Comment deleted"));
});

const getAllVideoComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.query;
    // console.log(videoId);
    if(!videoId){
        throw new ApiError(400,"Invalid VideoId");
    }
    // console.log(vidId);
    const pipeline = [
            {
                $match:{
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $project:{
                    _id: 0,
                    content:1,
                    owner: 1
                }
            }
    ];

    const commentList = await Comment.aggregate(pipeline);
    return res.status(200)
    .json(new ApiResponse(200,commentList,"CommentList returned"));
});

const getAllTweetComment = asyncHandler(async(req,res)=>{
    const {tweetId} = req.query;

    if(!tweetId){
        throw new ApiError(400,"Invalid tweetId");
    }

    const commentList = await Comment.aggregate(
        [
            {
                $match:{
                    tweet: tweetId
                }
            },
            {
                $project:{
                    _id:0,
                    content: 1
                }
            }
        ]
    );

    return res.status(200)
    .json(new ApiResponse(200,commentList,"CommentList returned"));
});

export{
    commentOnVideo,
    updateComment,
    commentOnComment,
    commentOnTweet,
    deleteComment,
    getAllVideoComment,
    getAllTweetComment
}

