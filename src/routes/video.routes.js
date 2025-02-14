import {Router} from "express"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deleteVideo, getVideoById, publishAVideo, tooglePublishStatus, updateDetails } from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJwt);
router.route("/").post(
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

router.route("/video/:videoId").get(getVideoById);
router.route("/delete/:videoId").post(deleteVideo);
router.route("/:videoId").post(tooglePublishStatus);
router.route("/update/:videoId").post(
    upload.single("thumbnail"),
    updateDetails
)

export default router;