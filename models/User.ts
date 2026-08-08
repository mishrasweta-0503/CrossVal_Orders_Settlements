
import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface IUser{
    email:string,
    password:string
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase:true, trim:true },
    password: { type: String, required: true }
}, { timestamps: true })


export const User = mongoose.models.User || model<IUser>('User', userSchema);