import express from "express";
import {
  getQueueStatus,
  getCategories,
  getDifficulties,
} from "../controllers/rest-controller.js";

const router = express.Router();

router.get("/status", getQueueStatus);
router.get("/categories", getCategories);
router.get("/difficulties", getDifficulties);

export default router;
