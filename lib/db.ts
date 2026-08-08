
import mongoose from "mongoose";


export default async function connectToDatabase(){
    if(mongoose.connection.readyState >= 1){
        return
    }
    const MONGODB_URI = process.env.MONGODB_URI;
    if(!MONGODB_URI){
        throw Error('MONGODB_URI is not set in .env.local')
    }
    await mongoose.connect(MONGODB_URI);
}