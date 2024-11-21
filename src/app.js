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
//static files like images
app.use(express.static("public"))

//import routes
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/users", userRouter);

export {app};