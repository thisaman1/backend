import { Router } from "express";
import { addTweet, deleteTweet, getAllTweet, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/user").get(getAllTweet);

router.use(verifyJwt);
router.route("/").post(addTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;