import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middlewares.js";
import { userController } from "../controllers/user.controller.js";
import { eventTypeController } from "../controllers/eventType.controller.js";
import { eventController } from "../controllers/event.controller.js";
import { eventRegistrationController } from "../controllers/eventRegistration.controller.js";
import { resultController } from "../controllers/result.controller.js";
import { adminController } from "../controllers/admin.controller.js";


const router = Router();

router.use(verifyJWT, verifyRole(["admin"]));


// Register a new org 
router.route("/orgs").get(adminController.fetchAllOrgs);
router.route("/orgs/register").post(adminController.registerOrg);
router.route("/orgs/update/:id").patch(adminController.updateOrg);
router.route("/orgs/delete/:id").delete(adminController.deleteOrg);


// Event Type routes
router.route("/event-type").get(eventTypeController.fetchAllEventTypes);
router.route("/event-type").post(eventTypeController.createEventType);
router.route("/event-type/update/:id").patch(eventTypeController.updateEventType);
router.route("/event-type/delete/:id").delete(eventTypeController.deleteEventType);

// Event routes
router.route("/events").get(eventController.fetchAllEvents);
router.route("/events").post(eventController.createEvent);
router.route("/events/update/:id").patch(eventController.updateEvent);
router.route("/events/delete/:id").delete(eventController.deleteEvent);



// Result routes
router.route("/result").post(resultController.createResult);
router.route("/result/update/:id").put(resultController.updateResult);
router.route("/result/delete/:id").delete(resultController.deleteResult);


export default router;
