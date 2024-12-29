import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { userController } from "../controllers/user.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";
import { eventRegistrationController } from "../controllers/eventRegistration.controller.js";

const router = Router();

router.use(verifyJWT, verifyRole(["admin", "organization"]));


router.route("/register").post( upload.single('image'), userController.registerUser);
router.route("/update").put(authController.updateUser);
router.route("/me").get(authController.getCurrentUser);
router.route("/delete").get(userController.deleteUserById);

// event registration routes
router.route("/event-registration").get(eventRegistrationController.getAllEventRegistrations);
router.route("/event-registration").post(eventRegistrationController.createEventRegistration);
router.route("/event-registration/:id").get(eventRegistrationController.getEventRegistrationById);
router.route("/event-registration/event/:id").get(eventRegistrationController.getEventRegistrationByEventId);
router.route("/event-registration/update/:id").patch(eventRegistrationController.updateEventRegistration);
router.route("/event-registration/delete/:id").delete(eventRegistrationController.deleteEventRegistration);

export default router;
