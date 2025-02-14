import { Router } from "express";
import { addTweet, deleteTweet, getAllTweet, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/get-all-tweet").get(getAllTweet);

router.use(verifyJwt);
router.route("/add-tweet").post(addTweet);
router.route("/update-tweet/:tweetId").post(updateTweet);
router.route("/delete-tweet/:tweetId").get(deleteTweet);

export default router;