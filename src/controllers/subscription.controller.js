import mongoose, { isValidObjectId, ObjectId} from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    const user = req.user;
    if(!(isValidObjectId(channelId) || !(isValidObjectId(req.user?._id))))throw new ApiError(400,"Invalid channel or userId");
    // if(!channelId){
    //     throw new ApiError(400,"ChannelId invalid");
    // }
    // if(!user){
    //     throw new ApiError(400,"User not found");
    // }

    // console.log(channelId);
    // console.log(user._id);
    const isSubscriber = await Subscription.exists({
        subscriber: new mongoose.Types.ObjectId(user._id),
        channel: new mongoose.Types.ObjectId(channelId)
    });

    if(isSubscriber){
        // console.log("deletion");
        await Subscription.findOneAndDelete({
            _id: isSubscriber._id
        })

        return res.status(200)
        .json(new ApiResponse(200,{isSubscribed: false},"Unsubscribed"));
    }
    else{
        // console.log("creation");
        await Subscription.create(
            {
                channel: channelId,
                subscriber: req.user?._id
            }
        )
        return res.status(200)
        .json(new ApiResponse(200,{isSubscribed: true},"Subscribed"));
    }
});

const getAllSubscriber = asyncHandler(async(req,res)=>{
    const user = req.user;
    
    const subscribers = await Subscription.aggregate(
        [
            {
                $match:{
                    channel: user._id
                }
            }
        ]
    );

    const subscribersList = subscribers.map((sub)=>sub.subscriber);
    // console.log(subscribers);
    return res.status(200)
    .json(new ApiResponse(200,subscribersList,"Subscribers returned"));
});

const getAllChannelsSubscribed = asyncHandler(async(req,res)=>{
    const user = req.user;

    const channels = await Subscription.aggregate(
        [
            {
                $match:{
                    subscriber: user._id
                }
            },
            {
                $lookup: {
                  from: "users", // name of the collection holding channel/user details
                  localField: "channel", // field in Subscription referencing the channel user id
                  foreignField: "_id", // field in the users collection
                  as: "channelDetails",
                },
            },
            { 
                $unwind: "$channelDetails" 
            },
            {
                $project: {
                  id: "$channelDetails._id",
                  name: "$channelDetails.userName",
                  // If 'avatar' is an array and you want the first element:
                  avatarUrl: { $arrayElemAt: ["$channelDetails.avatar", 0] },
                },
            },
        ]
    );
    // const channelsList = channels.map((channel)=>channel.channel);
    return res.status(200)
    .json(new ApiResponse(200,channels,"Channels returned"));
});

export {
    toggleSubscription,
    getAllSubscriber,
    getAllChannelsSubscribed
};