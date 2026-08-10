import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface ILineItem{
    description:string,
    quantity:number,
    unitPrice:number
}

interface IOrder extends Document {
    userId: Types.ObjectId;
    customername: string;
    dueDate: Date;
    lineItems: ILineItem[];
    subtotal: number;
    orderTotal: number;
  }

const LineItemSchema = new Schema<ILineItem>({
    description: { type: String,required: true },
    quantity: { type: Number, required: true, min: 1},
    unitPrice: {type: Number, required: true, min: 0 }
})

const orderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User',required: true , index: true},
    customername: { type: String, required: true,trim: true},
    dueDate: {type: Date, required: true },
    lineItems: {type: [LineItemSchema], required: true },
    subtotal: {type: Number, required: true },
    orderTotal: {type: Number, required: true }
},{ timestamps: true })


export const Order = mongoose.models.Order || model<IOrder>('Order', orderSchema);