import express from "express";
import { store } from "../controllers/tasks.controller.js";

const router = express.Router();

router.post("/", store);

export default router;