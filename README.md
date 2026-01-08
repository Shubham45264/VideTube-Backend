# VidTube Backend – Project Requirements Document (PRD)

## 📌 Project Overview

**VidTube** is a scalable and production-grade backend application inspired by video-sharing platforms like YouTube. It exposes a robust REST API to manage users, videos, subscriptions, playlists, and social interactions such as comments, likes, and creator posts.

The primary goal of this project is to design a **secure, performant, and maintainable backend** using modern Node.js development practices and scalable architecture patterns.

---

## 🛠️ Technology Stack

* **Runtime:** Node.js
* **Framework:** Express.js (v5+)
* **Database:** MongoDB
* **ODM:** Mongoose
* **Authentication:** JWT (Access & Refresh Tokens), Bcrypt.js
* **File Uploads:** Multer
* **Media Storage & CDN:** Cloudinary
* **Code Quality:** ESLint, Prettier

---

## ⚙️ Environment Setup

Create a `.env` file in the project root and configure the following variables:

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

## 🚀 Core Features & Functional Requirements

### 👤 User Management

* Secure user registration and login using JWT authentication
* Profile customization (avatar, cover image, account details)
* Watch history tracking
* Encrypted password storage and secure session handling

---

### 🎥 Video Management

* Upload videos with metadata (title, description, thumbnail)
* Cloudinary-based media storage and optimization
* Publish / unpublish videos
* Update or delete uploaded videos
* Advanced search, sorting, and pagination using aggregation pipelines

---

### 🔔 Subscription System

* Subscribe and unsubscribe from channels
* Real-time subscriber and subscription counts
* Channel relationship management

---

### 💬 Social Interactions

* Creator posts (Tweets)
* Comment system for videos
* Like / dislike functionality for videos, comments, and tweets

---

### 📂 Playlist Management

* Create public or private playlists
* Add or remove videos from playlists
* Update playlist metadata

---

### 📊 Creator Dashboard

* View total views, subscribers, and likes
* Centralized management of uploaded content
* Creator-focused analytics overview

---

## 🧱 System Architecture

### 📁 Folder Structure

```
src/
├── controllers/   # Business logic & request handlers
├── models/        # Mongoose schemas
├── routes/        # API route definitions
├── middlewares/   # Auth, uploads, validation, etc.
├── utils/         # Helpers (Cloudinary, responses, errors)
├── db/            # Database connection logic
```

---

### 📦 Data Models

* **User:** name, email, password, avatar, coverImage, watchHistory
* **Video:** videoFile, thumbnail, title, duration, views, owner
* **Comment:** content, video, owner
* **Like:** target (video/comment/tweet), likedBy
* **Playlist:** name, description, videos, owner
* **Subscription:** subscriber, channel
* **Tweet:** content, owner

---

## 🧠 Key Implementation Details

### 🔍 Advanced Aggregation Pipelines

* Subscriber count calculations
* Subscription status checks
* Channel profile generation
* Optimized video discovery and pagination

---

### 🧩 Middleware Architecture

* **Authentication Middleware:** JWT verification and user injection
* **Upload Middleware:** Multipart file handling via Multer
* **Global Error Handler:** Consistent API error responses

---

### 🖼️ Media Optimization

* Cloudinary integration for:

  * Automatic image/video optimization
  * Dynamic resizing
  * CDN-based fast delivery

---

## 🔗 API Endpoints (v1)

* `/api/v1/users` – Authentication & profiles
* `/api/v1/videos` – Video CRUD & discovery
* `/api/v1/subscriptions` – Channel subscriptions
* `/api/v1/comments` – Video comments
* `/api/v1/likes` – Like / dislike system
* `/api/v1/playlist` – Playlist management
* `/api/v1/tweets` – Creator updates
* `/api/v1/dashboard` – Creator analytics
* `/api/v1/healthcheck` – System status

---

## 🔮 Future Roadmap

* Real-time notifications using Socket.io
* Video recommendation algorithms
* Category and tag-based discovery
* Multi-tier subscription models
