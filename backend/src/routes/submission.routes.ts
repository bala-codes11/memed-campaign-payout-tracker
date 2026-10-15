import { Router } from "express";
import {
  createSubmission,
  getMySubmissions,
  updateSubmissionViews,
} from "../controllers/submission.controller";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("creator"),
  createSubmission
);

router.get(
  "/mine",
  authenticate,
  authorize("creator"),
  getMySubmissions
);
router.patch(
  "/:id/views",
  authenticate,
  authorize("creator"),
  updateSubmissionViews
);

export default router;