import dotenv from "dotenv";
import connectToDb from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
    path: "./.env"
})

connectToDb()
.then(()=>{
    app.on("error", (error) => {
        console.log(`Error Occured !!`, error); 
    })
    const port = process.env.PORT || 8000;
    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    })
})
.catch((error) => {
    console.log(`Database Connection Failed !!`, error);
});
