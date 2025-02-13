import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema(
{
    content:{
        type: String,
        required: true,
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    comment:{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps:true});

export const Comment = mongoose.model('Comment',commentSchema);