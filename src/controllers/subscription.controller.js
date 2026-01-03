import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
// import { Subscription } from "../models/subscription.model.js"
import { Subscription } from "../models/subscription.models.js";

import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

/**
 * ===============================
 * TOGGLE SUBSCRIPTION
 * ===============================
 */
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  const subscriberId = req.user._id

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }

  // Prevent subscribing to yourself
  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel")
  }

  // Check if channel exists
  const channel = await User.findById(channelId)
  if (!channel) {
    throw new ApiError(404, "Channel not found")
  }

  // Check if subscription already exists
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  })

  if (existingSubscription) {
    // Unsubscribe
    await existingSubscription.deleteOne()

    return res.status(200).json(
      new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
    )
  }

  // Subscribe
  await Subscription.create({
    channel: channelId,
    subscriber: subscriberId,
  })

  return res.status(201).json(
    new ApiResponse(201, { subscribed: true }, "Subscribed successfully")
  )
})

/**
 * ===============================
 * GET SUBSCRIBERS OF A CHANNEL
 * ===============================
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID")
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username avatar")
    .sort({ createdAt: -1 })

  return res.status(200).json(
    new ApiResponse(
      200,
      subscribers,
      "Channel subscribers fetched successfully"
    )
  )
})

/**
 * ===============================
 * GET CHANNELS A USER SUBSCRIBED TO
 * ===============================
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID")
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  })
    .populate("channel", "username avatar")
    .sort({ createdAt: -1 })

  return res.status(200).json(
    new ApiResponse(
      200,
      subscribedChannels,
      "Subscribed channels fetched successfully"
    )
  )
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
}
