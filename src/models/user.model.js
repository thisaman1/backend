import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
{
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String,    //cloudinary link
        required: true
    },
    coverImage:{
        type: String    //cloudinary link
    },
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken:{
        type: String
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ]
},{timestamps: true})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.pre('save', async function(next){
    if(!this.isModified('password'))return next();

    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.createAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.createRefreshToken = function(){
    jwt.sign(
        {
            _id: this._id,
            emial: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);