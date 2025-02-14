import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllLikedVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";


const router = Router();

router.use(verifyJwt);
router.route("/v/:videoId").get(toggleVideoLike);
router.route("/c/:commentId").get(toggleCommentLike);
router.route("/t/:tweetId").get(toggleTweetLike);
router.route("/").get(getAllLikedVideo);

export default router;