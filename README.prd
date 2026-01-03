# Project Requirements Document (PRD): VidTube Backend

## 1. Project Overview
**VidTube** is a complex backend application designed to mimic the core functionalities of a video-sharing platform like YouTube. It provides a robust API for managing users, videos, subscriptions, playlists, and social interactions (comments, likes, tweets).

The goal of this project is to build a scalable, secure, and performant backend using modern web technologies and best practices in Node.js development.

---

## 2. Technology Stack
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js (v5+)
- **Database:** MongoDB
- **ORM/ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT) & Bcrypt.js
- **File Handling:** Multer
- **Media Management:** Cloudinary
- **Code Styling:** Prettier & ESLint

---

## 3. Environment Setup
To run this project locally, create a `.env` file in the root directory and add the following variables:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 4. Core Features & Functional Requirements

### 4.1 User Management
- **Authentication:** Secure registration and login using JWT.
- **Profile Management:** Update avatars, cover images, and account details.
- **Watch History:** Track videos watched by the user.
- **Security:** Password hashing and secure cookie-based session management.

### 4.2 Video Management
- **Upload & Processing:** Support for video uploads with title, description, and thumbnail (via Cloudinary).
- **Control:** Publish/Unpublish videos, edit video metadata, and delete videos.
- **Search & Discovery:** Search, sort, and paginate videos using advanced aggregation pipelines.

### 4.3 Subscription System
- **Follow/Unfollow:** Users can subscribe to channels.
- **Subscriber Count:** Real-time tracking of channel subscribers and subbed channels.

### 4.4 Social Interactions
- **Tweets:** Short text-based posts for channel updates.
- **Comments:** Add, edit, and delete comments on videos.
- **Likes:** Like/dislike videos, comments, and tweets.

### 4.5 Playlist Management
- **Curation:** Create, update, and delete private or public playlists.
- **Organize:** Add or remove videos from playlists.

### 4.6 Dashboard
- **Analytics:** For content creators to view total video views, subscribers, and likes.
- **Management:** A centralized view of all uploaded content.

---

## 5. System Architecture

### 5.1 Folder Structure
- `src/controllers/`: Contains the logic for processing requests and returning responses.
- `src/models/`: Defines the data structure using Mongoose schemas.
- `src/routes/`: Map URI paths to specific controller functions.
- `src/middlewares/`: Functions that run during the request-response cycle (Auth, Upload, etc.).
- `src/utils/`: Helper classes for handling API responses, errors, and Cloudinary uploads.
- `src/db/`: Connection logic for MongoDB.

### 4.2 Data Models
- **User:** name, email, password, avatar, coverImage, watchHistory.
- **Video:** videoFile, thumbnail, title, duration, views, owner.
- **Comment:** content, video, owner.
- **Like:** video/comment/tweet, likedBy.
- **Playlist:** name, description, videos, owner.
- **Subscription:** subscriber, channel.
- **Tweet:** content, owner.

---

## 6. Key Implementation Details

### 6.1 Advanced Aggregation
Utilizes Mongoose aggregation pipelines for complex data fetching:
- Calculating subscriber counts and subscription status.
- Generating user channel profiles.
- Implementing efficient paginated search results for videos.

### 6.2 Middleware Architecture
- **Auth Middleware:** Verifies JWT and injects the user object into requests.
- **Multer Middleware:** Handles multi-part form data for file uploads before sending to Cloudinary.
- **Global Error Handler:** Standardized error response format across the entire API.

### 6.3 Media Optimization
- Integration with Cloudinary for automatic image and video optimization, resizing, and CDN delivery.

---

## 7. API Endpoints (v1)
- `/api/v1/users`: Auth and profile.
- `/api/v1/videos`: Video CRUD and search.
- `/api/v1/subscriptions`: Channel following logic.
- `/api/v1/comments`: Video commenting.
- `/api/v1/likes`: Like/Dislike logic.
- `/api/v1/playlist`: Playlist management.
- `/api/v1/tweets`: Content creator updates.
- `/api/v1/dashboard`: Creator stats.
- `/api/v1/healthcheck`: System status.

---

## 8. Future Roadmap
- Implementation of a real-time notification system (Socket.io).
- Advanced video recommendation algorithms.
- Category and Tag-based discovery systems.
- Multi-tier subscription models.
