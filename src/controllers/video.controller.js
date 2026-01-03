import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * ===============================
 * GET ALL VIDEOS (SEARCH + SORT + PAGINATION)
 * ===============================
 */
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const skip = (page - 1) * limit;

  const filter = { isPublished: true };

  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }

  const sortOptions = {
    [sortBy]: sortType === "asc" ? 1 : -1,
  };

  const videos = await Video.find(filter)
    .populate("owner", "username avatar")
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
        currentPage: Number(page),
        totalPages: Math.ceil(totalVideos / limit),
      },
      "Videos fetched successfully"
    )
  );
});

/**
 * ===============================
 * PUBLISH A VIDEO
 * ===============================
 */
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  // ✅ FIXED: Correct multer field names
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoUpload || !thumbnailUpload) {
    throw new ApiError(500, "File upload failed");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    duration: videoUpload.duration,
    owner: userId,
    isPublished: true,
  });
return res.status(201).json(
  new ApiResponse(201, video, "Video published successfully")
);

  
});

/**
 * ===============================
 * GET VIDEO BY ID
 * ===============================
 */
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "username avatar"
  );

  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  video.views += 1;
  await video.save();

  return res.status(200).json(
    new ApiResponse(200, video, "Video fetched successfully")
  );
});

/**
 * ===============================
 * UPDATE VIDEO
 * ===============================
 */
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  if (req.file?.path) {
    const thumbnailUpload = await uploadOnCloudinary(req.file.path);
    if (thumbnailUpload) {
      video.thumbnail = thumbnailUpload.url;
    }
  }

  await video.save();

  return res.status(200).json(
    new ApiResponse(200, video, "Video updated successfully")
  );
});

/**
 * ===============================
 * DELETE VIDEO
 * ===============================
 */
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }

  await video.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Video deleted successfully")
  );
});

/**
 * ===============================
 * TOGGLE PUBLISH STATUS
 * ===============================
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to modify this video");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { isPublished: video.isPublished },
      "Publish status updated"
    )
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
