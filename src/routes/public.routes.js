import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { userController } from "../controllers/user.controller.js";
import { eventController } from "../controllers/event.controller.js";
import { resultController } from "../controllers/result.controller.js";

const router = Router();

router.route("/registerAdmin").post(authController.registerAdmin);
router.route("/login").post(authController.loginUser);

router.route("/").get(userController.fetchAllUsers);


router.route("/events").get(eventController.fetchAllEvents);
router.route("/events/resultPublished").get(eventController.fetchResultPublishedEvents);

// router.route("/results/group").get(fetchAllGroupResults);
router.route("/results/single").get(resultController.fetchAllIndividualResults);
router.route("/results/leaderboard").get(resultController.fetchLeaderboard);
router.route("/results").get(resultController.fetchAllResults);
router.route("/result/:id").get(resultController.fetchResultById);
router
  .route("/result/event/:event_id")
  .get(resultController.fetchResultByEventId);


export default router;