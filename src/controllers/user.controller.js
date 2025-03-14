import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {isEmpty,isValidEmail,isValidPassword} from "../utils/validations.js"
import { uploadToCloudinary, deleteVideoFromCloudinary, deleteImageFromCloudinary} from "../utils/cloudinary.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import mongoose,{ isValidObjectId, trusted } from "mongoose";

const generateAccessTokenAndRefreshToken= async(user_id)=>{
    try {
        const user = await User.findById(user_id);

        const accessToken = user.createAccessToken();
        const refreshToken = user.createRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"Something went wrong");
    }
}

const registerUser = asyncHandler(async (req,res) => {

    // console.log(req);
    if (!req.files || !req.files.avatar ) {
        // console.log(req);
        throw new ApiError(400,"Files not uploaded correctly");
    }
    
    
    //get user details from frontend
    //validations on user details
    //check if user already exists
    //check for images, check for avatar
    //upload images to cloudinary
    //create user and save to db
    //remove password and refresh token from response
    //return response

    //get details from frontend
    const {fullName, email, password, userName} = req.body;
    // console.log(fullName,email,password,userName);
    //check if fields are empty
    if(isEmpty(fullName) || !fullName)throw new ApiError(400,"Full name is required");
    if(isEmpty(email))throw new ApiError(400,"Email is required");
    if(isEmpty(password))throw new ApiError(400,"password is required");
    if(isEmpty(userName) || !userName)throw new ApiError(400,"userName is required");
    
    //check if email and password is valid, email and userName is unique
    if(!isValidEmail(email))throw new ApiError(400,"Email is not valid");
    if(!isValidPassword(password))throw new ApiError(400,"Password length should be between 6-20 and must contain 1 digit,1 lowercase and uppercase English character and 1 special character.");

    const isUserExisted = await User.findOne({
        $or: [{userName},{email}]
    })
    if(isUserExisted){
        throw new ApiError(400, "User already exists");
    }
    
    let avatarImageLocalPath;
    let coverImageLocalPath;
    if(req.files){
        if(Array.isArray(req.files.avatar) && req.files.avatar.length>0){
            avatarImageLocalPath = req.files.avatar[0].path;
        }
        if(Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath = req.files.coverImage[0].path;
        }
    }
    
    if(!avatarImageLocalPath)throw new ApiError(407,"Avatar Image is required");
    const avatar = await uploadToCloudinary(avatarImageLocalPath,process.env.AVATAR_CLOUDINARY_PATH);
    const coverImage = await uploadToCloudinary(coverImageLocalPath,process.env.COVERIMAGE_CLOUDINARY_PATH);

    // console.log(avatar);
    if(!avatar){
        throw new ApiError(400,"Avatar is Required");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        avatar: [avatar.url,avatar.public_id],
        coverImage: [coverImage?.url || "", coverImage?.public_id || ""]
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something Went Wrong! Try Again");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )
})

const loginUser = asyncHandler(async (req,res)=>{
    //get username and password from req->body
    //perform validations(if empty or invalid formats)
    //find user in db
    //if doesn't exist tell user to register
    //if exists check password
    //if correct send accessToken and refreshToken to user via cookie(secure cookie)
    const {email, password} = req.body;
    if(isEmpty(email) || isEmpty(password)){
        throw new ApiError(400,"email or password cannot be empty");
    }
    const user = await User.findOne({
        email: email
    })
    if(!user){
        throw new ApiError(400,"User doesn't exist! Please Register");
    }

    const isCorrectPassword = await user.isPasswordCorrect(password);
    if(!isCorrectPassword){
        throw new ApiError(400,"Password Incorrect! Try Again.");
    }

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if(!loggedInUser){
        throw new ApiError(400,"user not found");
    }

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }
    
    // console.log("Setting cookies...");
    res.cookie("accessToken",accessToken,options);
    res.cookie('refreshToken',refreshToken,options);

    // console.log("Set-Cookie Headers:", res.getHeaders()["set-cookie"]);
    // console.log("Login:",req.cookies);
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User Logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                accessToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged Out"
        )
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken ||  req.body?.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized access");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
    
        if(!user){
            throw new ApiError(401,"Invalid refresh Token");
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Invalid refresh Token");
        }
    
        const {accessToken,newRefreshToken} = generateAccessTokenAndRefreshToken(user._id);
    
        const options={
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
    
        return res.status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(401,"Unauthorized Access");
    }

    if(await !user.isPasswordCorrect(oldPassword)){
        throw new ApiError(401,"Wrong Password")
    }

    if(!isValidPassword(newPassword)){
        throw new ApiError(401,"Password length should be between 6-20 and must contain 1 digit,1 lowercase and uppercase English character and 1 special character.");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed Successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = req.user;

    if(!user){
        throw new ApiError(401,"Please login");
    }

    return res.status(200)
    .json(new ApiResponse(200,user,"User fetched successfully"));
}) 

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body;
    console.log(req.body);
    if(!(fullName || email)){
        throw new ApiError(400,"All details are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName: fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password refreshToken")

    if(!user){
        throw new ApiError(400,"User not found");
    }
    // console.log(user);
    return res.status(200)
    .json(new ApiResponse(200,user,"Details Updated Successfully"));
})

const updateAvatarImage = asyncHandler(async(req,res)=>{
    if(!req.user){
        throw new ApiError(400,"Please login again!");
    }

    const avatarImageLocalPath = req.file?.path;

    if(!avatarImageLocalPath){
        throw new ApiError(400,"No file Uploaded");
    }

    const avatar = await uploadToCloudinary(avatarImageLocalPath,process.env.AVATAR_CLOUDINARY_PATH);
    if(!avatar?.url){
        throw new ApiError(400,"Upload to Cloudinary failed")
    }

    await deleteImageFromCloudinary(req.user.avatar[1],process.env.AVATAR_CLOUDINARY_PATH);
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: [avatar.url,avatar.public_id]
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar Updated Successfully")
    )
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    if(!req.user){
        throw new ApiError(400,"Please login again!");
    }

    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"No file Uploaded");
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath,process.env.COVERIMAGE_CLOUDINARY_PATH);
    if(!coverImage?.url){
        throw new ApiError(400,"Upload to Cloudinary failed")
    }

    if(req.user.coverImage[1]!== ""){
        await deleteImageFromCloudinary(req.user.coverImage[1],process.env.COVERIMAGE_CLOUDINARY_PATH);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage: [coverImage.url,coverImage.public_id]
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res.status(200)
    .json(
        new ApiResponse(200,user,"Cover Image Updated Successfully")
    )

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {userName} = req.params;
    if(!userName?.trim()){
        throw new ApiError(400,"Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                subscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName:1,
                userName:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1
            }
        }
    ]);

    // console.log(channel);
    if(!channel.length){
        throw new ApiError(400,"Channel doesn't exist");
    }

    return res.status(200)
    .json(
        new ApiResponse(200,channel[0],"user channel fetched")
    )
});

const getchannelById =  asyncHandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Id");
    }
    const pipeline = [
        {
            $match:{
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $lookup:{
                from:"likes",
                localField: "_id",
                foreignField: "video",
                as: "likedVideos"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size: "$subscribers"
                },
                subscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                },
                isVideoLiked:{
                    $cond:{
                        if:{$in: [req.user?._id,"$likedVideos"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName:1,
                userName:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                isVideoLiked:1,
            }
        }
    ];

    const user = await User.aggregate(pipeline);

    // console.log(user);
    if(!user){
        throw new ApiError(400,"Channel not found");
    }

    return res.status(200)
    .json(new ApiResponse(200,user,"User found"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatarImage,
    updateCoverImage,
    getUserChannelProfile,
    getchannelById
}