import {Router} from "express";
import {loginUser, logoutUser, registerUser,refreshAccessToken,changeCurrentPassword,updateAccountDetails,updateAvatarImage} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";

const router = Router();

// router.route("/register").get((req,res) => res.send("register page"));
// console.log("start");
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

router.route("/login").post(loginUser);

//secured route
router.route("/logout").post(verifyJwt,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt,changeCurrentPassword);
router.route("/update-account-details").post(verifyJwt,updateAccountDetails);
router.route("/update-avatar-image").post(verifyJwt,upload.single("avatar"),updateAvatarImage);

export default router;