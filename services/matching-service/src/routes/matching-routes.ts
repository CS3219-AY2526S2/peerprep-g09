import express from "express";
import {
  getQueueStatus,
  getCategories,
} from "../controllers/rest-controller.js";

const router = express.Router();

router.get("/status/:userId", getQueueStatus);
router.get("/categories", getCategories);

export default router;
