import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

/**
 * ===============================
 * GET CHANNEL STATS
 * ===============================
 */
const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }

  // Total videos uploaded by channel
  const totalVideos = await Video.countDocuments({ owner: channelId })

  // Total views on all videos of channel
  const totalViewsAgg = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ])

  const totalViews = totalViewsAgg[0]?.totalViews || 0

  // Total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  })

  // Total likes on all videos of channel
  const totalLikesAgg = await Like.aggregate([
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
      $match: {
        "videoData.owner": new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
      },
    },
  ])

  const totalLikes = totalLikesAgg[0]?.totalLikes || 0

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes,
      },
      "Channel stats fetched successfully"
    )
  )
})

/**
 * ===============================
 * GET ALL VIDEOS OF A CHANNEL
 * ===============================
 */
const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.user._id
  const { page = 1, limit = 10 } = req.query

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }

  const skip = (page - 1) * limit

  const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const totalVideos = await Video.countDocuments({ owner: channelId })

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
        currentPage: Number(page),
        totalPages: Math.ceil(totalVideos / limit),
      },
      "Channel videos fetched successfully"
    )
  )
})

export {
  getChannelStats,
  getChannelVideos,
}
