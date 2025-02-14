import {Router} from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllChannelsSubscribed, getAllSubscriber, toggleSubscription } from "../controllers/subscription.controller.js";


const router = Router();

router.use(verifyJwt);

router.route("/:channelId").post(toggleSubscription);
router.route("/subscribers").get(getAllSubscriber);
router.route("/channels").get(getAllChannelsSubscribed);

export default router;