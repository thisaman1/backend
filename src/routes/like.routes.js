import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllLikedVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";


const router = Router();

router.use(verifyJwt);
router.route("/toggle-video-like/:videoId").get(toggleVideoLike);
router.route("/toggle-comment-like/:commentId").post(toggleCommentLike);
router.route("/toggle-tweet-like/:tweetId").post(toggleTweetLike);
router.route("/get-all-liked-video").get(getAllLikedVideo);

export default router;