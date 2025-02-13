import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express();

//To share cross origin requests
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
//to accept json data
app.use(express.json({
    limit: "16kb"
}))
//data from urls
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())
//static files like images

//import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/subscriptions",subscriptionRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/comments",commentRouter);

export {app};