import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectToDb = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Connected Sucessfully ${connectionInstance.connection.host}`);
        console.log(connectionInstance);
    }
    catch(error){
        console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
        process.exit(1);
    }
}

export default connectToDb;