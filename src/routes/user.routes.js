import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js";

const router = Router()

router.route("/register").get((req,res) => res.send("register page"));
router.route("/register").post(registerUser)

export default router;