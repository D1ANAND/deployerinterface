import mongoose, { Document, Schema } from 'mongoose';

export interface ICidQueue extends Document {
    cid: string;
}

const cidQueueSchema: Schema = new Schema({
    cid: { type: String, required: true },
}, { timestamps: true });

const CidQueue = mongoose.models.CidQueue || mongoose.model<ICidQueue>('CidQueue', cidQueueSchema);

export default CidQueue;
