import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface IPayment{
    orderId:Types.ObjectId,
    userId:Types.ObjectId,
    amount:number,
    date:Date,
    note?:string
}

const paymentSchema = new Schema<IPayment>({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    amount: {type: Number, required: true, min: 0.01 },
    date: {type: Date, required: true, default: Date.now},
    note: {type:String, trim: true}
}, { timestamps: true })


export const Payment = mongoose.models.Payment || model<IPayment>('Payment', paymentSchema);