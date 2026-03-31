import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from  "../utils/ApiError.js"
import { User } from "../models/user.model.js";

import { uploadcloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiRespose.js";
import { json } from "express";

const userRegister=asyncHandler( async (req,res)=>{
  
   //get user details from frontend
   //validation- not empty
   //check if user already exists:username,email
   //check for images,check for avatar
   //uload them to cloudinary,avatar
   //create user object - creation entry in deb
   //remove password and refresh token field from response
   //check for user creation
   //return res


  const {fullName,email,username,password}=req.body || {}
  console.log("email:",email)
  
//   if(fullName==""){
//    throw new ApiError(400,"full name is required")
//   }

if(
   [fullName,email,username,password].some((field)=>
   field?.trim()==="")  //jodi empity hoi tahole true return korbe   ,trim white space remove kore in both side, both side trim korar poreo jodi space thae tahole
                         //true return korbe,akhane sob gulo field aksathe nia kaj kora ho66e ,advanse code practise
){
     throw new ApiError(400,"please fill the all things") 
      // apierror k throw kora ho66e jeta utils age banano hoa6ilo 400 holo status code, bakita message


}
//check user already exixt, at first amak user import korte hobe

//User.findOne({email})       // ai vabeo akta akta check kora jai,kin2 ami aksathe 2 ,3 ta check korbo sei 
// jonno operator use korte hobe ,operator doulaer sing dia lekha hoi

   const existenduser=User.findOne(
   {
      $or:[{username},{email}]
   }
)

if(existenduser){
   throw new ApiError(409,"user already exists")
}

//check for images ,check for avatar

const avatarLocalpath=req.files?.avatar[0]?.path;

const coverImagelocalpath=req.files?.coverImage[0]?.path;


if(!avatarLocalpath){
   throw new ApiError(409,"avatar ie required")
   
}

 const avatar=await uploadcloudinary(avatarLocalpath);
 const coverImage=await uploadcloudinary(coverImagelocalpath);

 if(!avatar){
   throw new ApiError(409,"avatar ie required");
 }

 const user=await User.create(
   {
      fullName,
      avatar:avatar.url,
      coverImage:coverImage?.url || "",
      email,
      password,
      username:username.toLowercase()
   }
 )

 //check user creation
  const createduserbyid=await User.findById(user._id).select(
   -password -refressToken  // jegulo remove korte hobe segulo likhte hoi because age thake sob seclect hoa a6e
  )

  if (!createduserbyid) {
   throw new ApiError(500,"something went wrong")
  }


  return res.status(201),json(
   new ApiResponse(200,createduserbyid,"user registerd successfully")
  )
  

})

export {userRegister}