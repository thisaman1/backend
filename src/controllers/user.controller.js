import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {isEmpty,isValidEmail,isValidPassword} from "../utils/validations.js"
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req,res) => {
    if (!req.files || !req.files.avatar ) {
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

export {registerUser}