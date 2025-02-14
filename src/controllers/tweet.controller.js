import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addTweet = asyncHandler(async(req,res)=>{
    const user = req.user;

    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Content is required");
    }

    const tweet = await Tweet.create({
        owner: user._id,
        content: content
    });

    if(!tweet){
        throw new ApiError(404,"Something went wrong");
    }

    return res.status(200)
    .json(new ApiResponse(200,tweet,"Tweet Added"));
});

const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(400,"Invalid tweetId");
    }

    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Content is required");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        {_id:tweetId},
        {
            content:content 
        },
        {
            new: true
        }
    );

    if(!tweet){
        throw new ApiError(404,"Something went wrong");
    }

    return res.status(200)
    .json(new ApiResponse(200,tweet,"Tweet Updated"));
});

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;

    if(!tweetId){
        throw new ApiError(400,"Invalid tweetId");
    }

    const isTweeted = await Tweet.findByIdAndDelete({
        _id: tweetId
    });


    return res.status(200)
    .json(new ApiResponse(200,isTweeted,"Tweet Deleted"));
});

const getAllTweet = asyncHandler(async(req,res)=>{
    const {userName} = req.query;

    if(!userName){
        throw new ApiError(400,"Invalid userName");
    }
    const user = await User.findOne({userName: userName});

    const pipeline = [
        {
            $match:{
                owner: user._id
            }
        },
        {
            $project:{
                _id: 0,
                content: 1
            }
        }
    ];

    const tweetList = await Tweet.aggregate(pipeline);
    return res.status(200)
    .json(new ApiResponse(200,tweetList,"List Returned"));
});

export {
    addTweet,
    updateTweet,
    deleteTweet,
    getAllTweet
}


