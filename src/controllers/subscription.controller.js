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

    const isSubscriber = await Subscription.exists({
        subscriber: req.user?._id,
        channel: channelId
    });

    if(isSubscriber){
        // console.log("deletion");
        await Subscription.findOneAndDelete({
            _id: isSubscriber._id
        })
    }
    else{
        // console.log("creation");
        await Subscription.create(
            {
                channel: channelId,
                subscriber: req.user?._id
            }
        )
    }

    return res.status(200)
    .json(new ApiResponse(200,isSubscriber,"Subscription Handled"));
});



export {toggleSubscription};