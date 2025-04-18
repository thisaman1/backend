import {Router} from "express";
import {loginUser, logoutUser, registerUser,refreshAccessToken,
    changeCurrentPassword,getCurrentUser,updateAccountDetails,updateAvatarImage,
    updateCoverImage,getUserChannelProfile,
    getchannelById} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/channel/:channelId").get(getchannelById);

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    // (req, res, next) => {
    //     console.log("Files received by multer:", req.files); // Log multer's output
    //     console.log("Request body:", req.body);              // Log additional form data
    //     next();
    // },
    registerUser
);

router.route("/login").post(loginUser,verifyJwt);

//secured route

router.route("/logout").post(verifyJwt,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt,changeCurrentPassword);
router.route("/get-current-user").get(verifyJwt,getCurrentUser);
router.route("/update").post(verifyJwt,upload.none(),updateAccountDetails);
router.route("/avatar").post(verifyJwt,upload.single("avatar"),updateAvatarImage);
router.route("/coverimage").post(verifyJwt,upload.single("coverImage"),updateCoverImage);
router.route("/c/:userName").get(getUserChannelProfile);

export default router;