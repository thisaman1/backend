import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addToPlaylist, createPlaylist, deletePlaylist, getPlaylistVideo, getUserPlaylist, removeVideo, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/create").post(createPlaylist);
router.route("/add/:playlistId").post(addToPlaylist);
router.route("/update/:playlistId").patch(updatePlaylist);
router.route("/delete/:playlistId").delete(deletePlaylist);
router.route("/").get(getUserPlaylist);
router.route("/videos/:playlistId").get(getPlaylistVideo);
router.route("/remove/:playlistId/:videoId").patch(removeVideo);

export default router;