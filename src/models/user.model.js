import mongoose, {Schema} from "mongoose";

import bcrypt from "bcrypt"

import jwt from "jsonwebtoken"

const userSchema=new Schema (
    {
        username:{
            type: String,
            unique:true,
            required:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type: String,
            unique:true,
            required:true,
            lowercase:true,
            trim:true,
            
        },
        fullName:{
            type: String,
            required:true,
            lowercase:true,
            trim:true,
            index:true
        },
        password:{
            type:String,
            required:[true,"Password must required"],
            unique:true,

        },
        avatar:{
           type:String,  //cloudinary url
           required:true

        },
        watchHistory:[{
            type:Schema.Types.ObjectId,
            ref:"Video"
            
        }],
        refressToken:{
            type:String
        },
        
    },
    {
        timestamps:true
    }
)
 
userSchema.pre( "save", async function (next){

    if(!this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.checkpassword= async function (password){
 return await  bcrypt.compare(password,this.password)
}

userSchema.methods.generatetoken= async function(){
   return jwt.sign(
        {
        _id:this._id,
        username:this.username,
        fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn: process.env.ACESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.refreshtoken= async function(){
   return jwt.sign(
        {
        _id:this._id,
        
        },
        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)