import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {isEmpty,isValidEmail,isValidPassword} from "../utils/validations.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { trusted } from "mongoose";

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

    if (!req.files || !req.files.avatar ) {
        // console.log(req);
        res.status(400);
        throw new Error("Files not uploaded correctly");
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

    //check if fields are empty
    if(isEmpty(fullName))throw new ApiError(400,"Full name is required");
    if(isEmpty(email))throw new ApiError(400,"Email is required");
    if(isEmpty(password))throw new ApiError(400,"password is required");
    if(isEmpty(userName))throw new ApiError(400,"userName is required");
    
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
    
    const avatar = await uploadToCloudinary(avatarImageLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    // console.log(avatar);
    if(!avatar){
        throw new ApiError(400,"Avatar is Required");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
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
    const {userName, password} = req.body;
    if(isEmpty(userName) || isEmpty(password)){
        throw new ApiError(400,"username or password cannot be empty");
    }
    const user = await User.findOne({
        userName
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

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
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
        secure: true
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
            secure: true
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



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}