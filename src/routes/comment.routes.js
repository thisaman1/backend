import { Router } from "express";
import { commentOnVideo,commentOnTweet,commentOnComment,updateComment,deleteComment,getAllVideoComment,getAllTweetComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

//public route
router.route("/get-all-video-comment").get(getAllVideoComment);
router.route("/get-all-tweet-comment").get(getAllTweetComment);

//secure route
router.use(verifyJwt);
router.route("/comment-on-video/:videoId").post(commentOnVideo);
router.route("/comment-on-comment/:commentId").post(commentOnComment);
router.route("/comment-on-tweet/:tweetId").post(commentOnTweet);
router.route("/update-comment/:commentId").post(updateComment);
router.route("/delete-comment").get(deleteComment);

export default router;