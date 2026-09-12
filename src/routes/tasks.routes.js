import express from "express";
import { index, store } from "../controllers/tasks.controller.js";

const router = express.Router();

router.post("/", store);
router.get("/", index);

export default router;