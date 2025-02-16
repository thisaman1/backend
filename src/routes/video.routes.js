import {Router} from "express"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, tooglePublishStatus, updateDetails } from "../controllers/video.controller.js";

const router = Router();

router.route("/").get(getAllVideos);
router.route("/video/:videoId").get(getVideoById);

router.use(verifyJwt);
router.route("/upload").post(
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


router.route("/delete/:videoId").post(deleteVideo);
router.route("/:videoId").post(tooglePublishStatus);
router.route("/update/:videoId").post(
    upload.single("thumbnail"),
    updateDetails
)

export default router;