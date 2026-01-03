import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";  
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens", error);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some(field => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  let avatar;
  let coverImage;

  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);

    if (coverLocalPath) {
      coverImage = await uploadOnCloudinary(coverLocalPath);
    }

    const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "User registered successfully", createdUser));

  } catch (error) {
    if (avatar?.public_id) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage?.public_id) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw error;
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from body
  const { email,username,password } = req.body;

  // validation
  if(!email){
    throw new ApiError(400, "Email is required");
  }
  

  // check exisiting user
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if(!user){
    throw new ApiError(404, "User not found");
  }
  //  validate password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401, "Password is incorrect");
  }

  // generate tokens
  const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id)
  .select(
    "-password -refreshToken"
  );
  
  if(!loggedInUser){
    throw new ApiError(404, "User not found");
  }
  
const options = {
  httpOnly: true,
  secure:process.env.NODE_ENV === "production",
}

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "Login successful", {user: loggedInUser, accessToken, refreshToken}

    ));
});


const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{refreshToken: undefined},
      $currentDate: {
        updatedAt: true
      }
    },
    {
      new:true
    }
  )
  const options= {
    httpOnly: true,
    secure:process.env.NODE_ENV === "production",
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, "Logout successful", {}))

  }); 

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "User deleted. Please login again.");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken,
        refreshToken,
      })
    );
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user?._id);


  const isPassword = await user.isPasswordCorrect(oldPassword);

  if(!isPassword){
    throw new ApiError(401, "Old password is incorrect");
  }
  user.passsword = newPassword;
  await user.save({validateBeforeSave: false});
  return res.status(200).json(new ApiResponse(200, "Password changed successfully", {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, "Current User Details",req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, "Account details updated successfully", user)
  );
});


const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path ;

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if(!avatar.url){
    throw new ApiError(500, "Failed to upload avatar");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $set:{avatar:avatar.url}
  },
  {
    new:true
  }
  ).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, "Avatar updated successfully", {}));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required");
  }

  // upload to cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(500, "Failed to upload cover image");
  }

  // get current user (to optionally delete old image)
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // OPTIONAL (Best Practice): delete old cover image
  if (user.coverImage) {
    await deleteFromCloudinary(user.coverImage);
  }

  // update DB
  user.coverImage = coverImage.url;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, "Cover image updated successfully", {
      coverImage: user.coverImage,
    })
  );
});


const getuserChannelProfile = asyncHandler(async (req, res) => {
 const {username} =  req.params

 if(!username?.trim()){
  throw new ApiError(400, "Username is required");
 }

 const channel = await User.aggregate(
  [
    {
    $match:{
      username: username.toLowerCase()
    }
  },
  {
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"subscriber",
      as:"subscribers"
    }  
  },
  {
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"subscriber",
      as:"subscriberedTo"
    },

  },
  {
    $addFields:{
      subscribersCount:{
        $size:"$subscribers"
      },
      channelsSubsribedToCount:{
        $size:"$subscriberedTo"
      },
      isSubsribed:{
        $cond : {
          if:{
            $in:[req.user?._id, "$subscribers.subscriber"]
          },
          then:true,
          else:false
        }
      }
  }
  },{
    // project only necessary fields
    $project:{
      fullname:1,
      username:1,
      avatar:1,
      subscribersCount:1,
      channelsSubsribedToCount:1,
      isSubsribed:1,
      coverImage:1,
      email:1

  }
}
  ]

 );
  if(!channel || channel.length ===0){
    throw new ApiError(404, "Channel not found");
  }else{
    return res.status(200).json(new ApiResponse(200, "Channel profile", channel[0]));
  }
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Watch history fetched successfully",
      user[0]?.watchHistory || []
    )
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
  getuserChannelProfile
}