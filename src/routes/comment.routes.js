import { Router } from "express";
import { commentOnVideo,commentOnTweet,commentOnComment,updateComment,deleteComment,getAllVideoComment,getAllTweetComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

//public route
router.route("/videos/:videoId").get(getAllVideoComment);
router.route("/tweets/:tweetId").get(getAllTweetComment);

//secure route
router.use(verifyJwt);
router.route("/v/:videoId").post(commentOnVideo);
router.route("/c/:commentId").post(commentOnComment);
router.route("/t/:tweetId").post(commentOnTweet);
router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;