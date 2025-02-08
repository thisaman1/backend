import {Router} from "express"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deleteVideo, getVideoById, publishAVideo, tooglePublishStatus, updateDetails } from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJwt);
router.route("/publish-a-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);

router.route("/get-video-by-id/:videoId").get(getVideoById);
router.route("/delete-video/:videoId").post(deleteVideo);
router.route("/toggle-publish-status/:videoId").post(tooglePublishStatus);
router.route("/update-details/:videoId").post(
    upload.single("thumbnail"),
    updateDetails
)

export default router;