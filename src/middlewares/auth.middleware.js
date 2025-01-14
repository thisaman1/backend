import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyJwt = asyncHandler(async (req, _, next)=>{
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        // console.log(token);
        
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
        // console.log(process.env.ACCESS_TOKEN_SECRET);
        
        const verifiedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(verifiedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Access token");
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid AccessToken");
    }
})

export {verifyJwt};