import express from "express";
import {
  getQueueStatus,
  getCategories,
} from "../controllers/rest-controller.js";

const router = express.Router();

router.get("/status", getQueueStatus);
router.get("/categories", getCategories);
router.get("/difficulties", getCategories);

export default router;
