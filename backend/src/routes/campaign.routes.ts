import { Router } from "express";
import {
  createCampaign,
  getBrandCampaigns,
  getLiveCampaigns,
} from "../controllers/campaign.controller";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/live", authenticate, authorize("creator"), getLiveCampaigns);

router.post("/", authenticate, authorize("brand"), createCampaign);

router.get("/", authenticate, authorize("brand"), getBrandCampaigns);

export default router;