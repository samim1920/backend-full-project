import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from  "../utils/ApiError.js"
import { User } from "../models/user.model.js";

import { uploadcloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessandRefreshToken= async (userid)=>{
  try {

   const myuser= await User.findById(userid)
   const myuseraccesstoken= await myuser.generatetoken()
   const myuserrefreshtoken= await myuser.refreshtoken()

   //refreshtoken  k data base  a save kore rakhte hobe jeno bar bar password dite na hoi

   myuser.refreshToken=myuserrefreshtoken
  await myuser.save({validateBeforeSave:false})

  return {myuseraccesstoken,myuserrefreshtoken}
   
  } catch (error) {
   throw new ApiError(404,error)
  }
}



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


  const {fullName,email,username,password}=req.body 
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

   const existenduser= await User.findOne(
   {
      $or:[{username},{email}]
   }
)

if(existenduser){
   throw new ApiError(409,"user already exists")
}

//check for images ,check for avatar

// console.log(req.files)


const avatarLocalpath=req.files?.avatar?.[0]?.path;
console.log("path:",avatarLocalpath)

const coverImagelocalpath=req.files?.coverImage?.[0]?.path;
console.log("Cover Image local path : ", coverImagelocalpath)

if(!avatarLocalpath){
   throw new ApiError(400,"avatar ie required")
   
}
console.log("avatar:",avatarLocalpath)
let avatar
  try {
   avatar = await uploadcloudinary(avatarLocalpath);
   console.log("Avatar uploaded successfully")
  } catch (error) {
   console.log("Err Uploading the avatar", error)
  }
const coverImage = coverImagelocalpath
  ? await uploadcloudinary(coverImagelocalpath)
  : null;
 if(!avatar){
   throw new ApiError(409,"avatar is required");
 }

 const user=await User.create(
   {
      fullName,
      avatar:avatar?.url,
      coverImage:coverImage?.url || "",
      email,
      password,
      username:username.toLowerCase()
   }
 )

 //check user creation
  const createduserbyid=await User.findById(user._id).select(
  " -password -refreshToken"  // jegulo remove korte hobe segulo likhte hoi because age thake sob seclect hoa a6e
  )

  if (!createduserbyid) {
   throw new ApiError(500,"something went wrong")
  }


res.status(201).json(
   new ApiResponse(200,createduserbyid,"user registerd successfully")
  )
  


})

const userLogin=asyncHandler(async(req,res)=>{

   //res body->data
   // username, email
   //email,password
   //access and refresh token
   //send cokies

   const {username,email,password}=req.body
   console.log("email:",email);

   if (!((username || email) && password)) {
      throw new ApiError(400,"username or password is must be required")

   }
     const user=  await User.findOne(
         {
         $or:[{username},{email}]
         }
      )

      if (!user) {
         throw new ApiError(404,"user does not exist")
      }

    const ispassword=  await user.checkpassword(password)

    if (!ispassword) {
      throw new ApiError(400,"Please enter correct password")
      
    }
      

     const {myuseraccesstoken,myuserrefreshtoken}=await generateAccessandRefreshToken(user._id)
   
   console.log("hello:",user._id)

  const loggedInuser=await User.findById(user._id).select(
   "-password -refreshToken"
  )

  const option={
   httpOnly:true,
   secure:true
  }
 return res
 .status(200)
 .cookie("accessToken",myuseraccesstoken,option)
 .cookie("refreshToken",myuserrefreshtoken,option)
 .json(
   new ApiResponse(
   {
      user:loggedInuser,myuseraccesstoken,myuserrefreshtoken
   },
   "user loogiedIn sucessfully"
 )

 )
})

const userLogout=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
      req.user._id,

      {
         $set:{
            refreshToken:undefined
         },
      
         
      },
      {
         new:true
      }
   )
   const option={
   httpOnly:true,
   secure:true
  }

  return res
  .status(201)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(new ApiResponse(200,{},"user logged out"))
})

const refreshAccessToken= asyncHandler(async(req,res)=>{
   const incomingRefreshToken=req.cookie.refreshToken || req.boody.refreshToken
   if (!incomingRefreshToken) {
      throw new ApiError(401,"unauthorized request")
      
   }

  try {
   const decodedToken= jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET)
 
 
 
   const user=await User.findById(decodedToken?._id)
 
   if(!user){
    throw new ApiError(401,"Invallis refresh token")
   }
 
 
 
   if(incomingRefreshToken!==refreshToken){
     throw new ApiError(401,"Refresh token is expired or used")
   }
 
 const option={
 httpOnly:true,
 secure:ture
 }
 
    const {accessToken,newrefreshToken}=await generateAccessandRefreshToken()
 
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",newrefreshToken,option)
     .json(
      new ApiResponse(
       200,
       {accessToken, refreshToken:newrefreshToken},
          "AccessToken is refreshed"
       
      )
     )
 
 
  } catch (error) {
   throw new ApiError(401,error?.message || "Invalid refreshToken")
  }

  })

  const ChangecurrentPassword=asyncHandler(async(req,res)=>{

   const {oldPassword,newPassword}=req.body
   const user=await User.findById( req.user?._id)

  const ispasswordcorrect= await user.checkpassword(oldPassword)
    
  if (!ispasswordcorrect) {
     throw new ApiError(400,"Enter correct password")
  }

  user.password=newPassword

  user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
   new ApiResponse(
      200, {},"Password sucessfully change"
   )
  )




  })

  const getcurrentuser=asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(
    new ApiResponse( 200,req.user,"current user fetched successfully")
   )
   
  })

  const updateuser=asyncHandler(async(req,res)=>{
   const {fullName,email}=req.body

   if(!fullName || !email){
      throw new ApiError(401,"All fields are required")
   }

   const user= await User.findByIdAndUpdate(
      req.user._id,
      {},
      {new:true} //new information return hoi


   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200,user,"Account update successfully")
   )
  })

  const updateuseravatar=asyncHandler(async(req,res)=>{
   const avatarLocalpath = await req.file?.path

   if (!avatarLocalpath) {
      throw new ApiError(400,"Avatar is missing")
      
   }

  const avatar= uploadcloudinary(avatarLocalpath)

  if (!avatar.url) {
   
   throw new ApiError(400,"upload avatar")
  }

 const user= User.findByIdAndUpdate(
   req.user._id,
   {
      $set:{
         avatar:avatar.url
      }
   },
   {new:true}
  )

  return res
  .status(200)
  .json(
   new ApiResponse(200,user,"Avatar  update successfully")
  )


  })

  const updateusercoverimage=asyncHandler(async(req,res)=>{
   const coverimageLocalpath = await req.file?.path

   if (!coverimageLocalpath) {
      throw new ApiError(400,"CoverImage is missing")
      
   }

  const coverImage= uploadcloudinary(coverimageLocalpath)

  if (!coverImage.url) {
   
   throw new ApiError(400,"upload coverimage")
  }

 const user= await User.findByIdAndUpdate(
   req.user._id,
   {
      $set:{
         coverImage:coverImage.url
      }
   },
   {new:true}
  )

  return res
  .status(200)
  .json(
   new ApiResponse(200,user,"coverimage update successfully")
  )


  })


  const getchalleldetails=asyncHandler(async(req,res)=>{

  const {username}= req.params

  if(!username?.trim()){

   throw new ApiError(401,"Missing username")

  }

   const channel=await  User.aggregate([
      {
         $match:{
            username:username?.toLowerCase()
         },
     
      },
                     //amak k k subscribe kore6e
          {
                                         
            $lookup:{
               from:"subscriptions",
               localField:"_id",
               foreignField:"channel",
               as:"subscribers"
               
            }
         },
         // ami kak kak subscribe kore6i

         {
            $lookup:{
               from:"subscriptions",
               localField:"_id",
               foreignField:"subscriber",
               as:"subscribedTo"
         }
      },

      {
         $addFields:{
            subscribersCount:{
               $size:"$subscribers" 
            // sdd $ because subscriber is a field


            },
            channelsSubscribeToCount:{
               $size:"$subscribedTo"
            },
            isSubscribed:{
               $cond:{
                  if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                  then:true,
                  else:false
               }
            }
         }
      },

      {
         $project:{
            fullName:1,
            userName:1,
            subscribersCount:1,
            channelsSubscribeToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1

            

         }
      }

   ])

   if (!channel?.length) {
      throw new ApiError(401,"channel does not exist")
      
   }

   return res
   .status(200)
   .json(
      new ApiResponse(200,channel[0],"User fetched successfully")
   )
  
  })

  const getwatchHistory= asyncHandler(async(req,res)=>{
   
  const user=  await User.aggregate([
      {
         $match:{
            _id:new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
               {
                  $lookup:{
                     from:"users",
                     localField:"owner",
                     foreignField:"_id",
                     as:"owner",
                     pipeline:[
                        {
                           $project:{
                              fullName:1,
                              username:1,
                              avatar:1
                           }
                        }
                     ]
                  }
               },
               {
                  $addFields:{
                     owner:{
                        $first:"$owner"
                     }
                  }
               }

            ]
         }
      }

      
    ])
   return res
   .status(200)
   .json(
      new ApiResponse(
         200,
         user[0].watchHistory,
         "watch history fetched successfully"
      )
               
   )
      
   

  })




export {
   userRegister,
   userLogin,
   userLogout,
   refreshAccessToken,
   ChangecurrentPassword,
   getcurrentuser,
   updateuser,
   updateuseravatar,
   updateusercoverimage,
   getchalleldetails,
   getwatchHistory
}