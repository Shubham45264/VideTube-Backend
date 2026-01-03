import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

/**
 * Subscribe / Unsubscribe to a channel
 * AND get subscribers of a channel
 */
router
  .route("/channel/:channelId")
  .get(getUserChannelSubscribers)   // subscribers of channel
  .post(toggleSubscription);        // subscribe/unsubscribe

/**
 * Get channels a user has subscribed to
 */
router
  .route("/user/:subscriberId")
  .get(getSubscribedChannels);

export default router;
