import mongoose,{isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body;
    const {videoId} = req.query;

    if(!name){
        throw new ApiError(400,"Name is required");
    }
    
    const playlistDescription = description?.trim()!==""?description?.trim():"";
    const playlistVideo = isValidObjectId(videoId)?[mongoose.Types.ObjectId(videoId)]:[];

    const playlist = await Playlist.create({
        name: name,
        description: playlistDescription,
        video: playlistVideo,
        owner: req.user._id
    });

    return res.status(200)
    .json(new ApiResponse(200,playlist,"Playlist Created"));
});

const addToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const {videoId} = req.query;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"PlaylistId invalid");
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId Invalid");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    );

    if(!updatedPlaylist){
        throw new ApiError(400,"Playlist Not Found");
    }

    return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video Added"));

});

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;

    const {name,description} = req.body;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"PlaylistId Invalid");
    }

    const playlistName = name?.trim()!==""?name?.trim():"";
    const playlistDescription = description?.trim()!==""?description?.trim():"";

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: playlistName,
            description: playlistDescription
        },
        {
            new: true
        }
    );

    if(!updatedPlaylist){
        throw new ApiError(400,"Playlist Not found");
    }

    return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Playlist Updated"));
});

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"PlaylistId Invalid");
    }

    const isDeleted = await Playlist.findByIdAndDelete(
        playlistId
    );

    if(!isDeleted){
        throw new ApiError(400,"Playlist Not found");
    }

    return res.status(200)
    .json(new ApiResponse(200,isDeleted,"Playlist Deleted"));
});

const getUserPlaylist = asyncHandler(async(req,res)=>{
    const pipeline = [
        {
            $match:{
                owner: req.user._id
            }
        },
        {
            $addFields:{
                videoCount: {
                    $size: "$video"
                }
            }  
        },
        {
            $project:{
                _id: 0,
                name: 1,
                description: 1,
                videoCount: 1
            }
        }
    ];

    const userPlaylists = await Playlist.aggregate(pipeline);

    if(!userPlaylists){
        throw new ApiError(400,"No playlist Found");
    }

    return res.status(200)
    .json(new ApiResponse(200,userPlaylists,"Playlists returned"));
});

const getPlaylistVideo = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"PlaylistId Invalid");
    }

    const pipeline = [
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $addFields:{
                totalVideos:{
                    $size: "$video"
                }
            }
        },
        {
            $project:{
                _id: 0,
                video: 1,
                totalVideos: 1
            }
        }
    ];

    const videos = await Playlist.aggregate(pipeline);

    if(!videos){
        throw new ApiError(400,"No Playlist Found");
    }

    return res.status(200)
    .json(new ApiResponse(200,videos,"Videos returned"));
});

const removeVideo = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"PlaylistId Invalid");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId Invalid");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            new: true
        }
    );

    if(!updatedPlaylist){
        throw new ApiError(400,"No Playlist Found");
    }

    return res.status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Playlist Updated"));
});

export{
    createPlaylist,
    addToPlaylist,
    updatePlaylist,
    deletePlaylist,
    getUserPlaylist,
    getPlaylistVideo,
    removeVideo
}