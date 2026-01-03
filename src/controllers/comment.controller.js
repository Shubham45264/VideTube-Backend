import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

/**
 * ===============================
 * GET ALL COMMENTS FOR A VIDEO
 * ===============================
 */
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID")
  }

  const skip = (page - 1) * limit

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const totalComments = await Comment.countDocuments({ video: videoId })

  return res.status(200).json(
    new ApiResponse(200, {
      comments,
      totalComments,
      currentPage: Number(page),
      totalPages: Math.ceil(totalComments / limit),
    }, "Comments fetched successfully")
  )
})

/**
 * ===============================
 * ADD A COMMENT TO A VIDEO
 * ===============================
 */
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { content } = req.body

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required")
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID")
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  })

  return res.status(201).json(
    new ApiResponse(201, comment, "Comment added successfully")
  )
})

/**
 * ===============================
 * UPDATE A COMMENT
 * ===============================
 */
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { content } = req.body

  if (!content?.trim()) {
    throw new ApiError(400, "Updated content is required")
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  // Only owner can update
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this comment")
  }

  comment.content = content
  
  await comment.save()

  return res.status(200).json(
    new ApiResponse(200, comment, "Comment updated successfully")
  )
})

/**
 * ===============================
 * DELETE A COMMENT
 * ===============================
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  // Only owner can delete
  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this comment")
  }

  await comment.deleteOne()

  return res.status(200).json(
    new ApiResponse(200, null, "Comment deleted successfully")
  )
})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
}
