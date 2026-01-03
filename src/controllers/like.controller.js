import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

/**
 * ===============================
 * TOGGLE LIKE ON VIDEO
 * ===============================
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const userId = req.user._id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID")
  }

  // Check if user already liked this video
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  })

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne()

    return res.status(200).json(
      new ApiResponse(200, { liked: false }, "Video unliked successfully")
    )
  }

  // Like
  await Like.create({
    video: videoId,
    likedBy: userId,
  })

  return res.status(201).json(
    new ApiResponse(201, { liked: true }, "Video liked successfully")
  )
})

/**
 * ===============================
 * TOGGLE LIKE ON COMMENT
 * ===============================
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const userId = req.user._id

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID")
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  })

  if (existingLike) {
    await existingLike.deleteOne()

    return res.status(200).json(
      new ApiResponse(200, { liked: false }, "Comment unliked successfully")
    )
  }

  await Like.create({
    comment: commentId,
    likedBy: userId,
  })

  return res.status(201).json(
    new ApiResponse(201, { liked: true }, "Comment liked successfully")
  )
})

/**
 * ===============================
 * TOGGLE LIKE ON TWEET
 * ===============================
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  const userId = req.user._id

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID")
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  })

  if (existingLike) {
    await existingLike.deleteOne()

    return res.status(200).json(
      new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
    )
  }

  await Like.create({
    tweet: tweetId,
    likedBy: userId,
  })

  return res.status(201).json(
    new ApiResponse(201, { liked: true }, "Tweet liked successfully")
  )
})

/**
 * ===============================
 * GET ALL LIKED VIDEOS
 * ===============================
 */
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoData",
      },
    },
    { $unwind: "$videoData" },
    {
      $replaceRoot: { newRoot: "$videoData" },
    },
  ])

  return res.status(200).json(
    new ApiResponse(
      200,
      likedVideos,
      "Liked videos fetched successfully"
    )
  )
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
}
