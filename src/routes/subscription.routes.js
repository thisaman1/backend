import {Router} from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllChannelsSubscribed, getAllSubscriber, toggleSubscription } from "../controllers/subscription.controller.js";




const router = Router();

router.use(verifyJwt);

router.route("/toggle-subscription/:channelId").post(toggleSubscription);
router.route("/get-all-subscriber").get(getAllSubscriber);
router.route("/get-channels-subscribed").get(getAllChannelsSubscribed);

export default router;