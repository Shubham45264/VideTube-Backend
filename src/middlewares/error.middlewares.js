import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert unknown errors into ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode
      ? error.statusCode
      : error instanceof mongoose.Error
      ? 400
      : 500;

    const message = error.message || "Something went wrong";

    error = new ApiError(
      statusCode,
      message,
      error?.errors || [],
      error.stack
    );
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  };

  // Show stack only in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
