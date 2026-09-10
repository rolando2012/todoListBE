import express from "express";
import { store } from "../controllers/categories.controller.js";

const router = express.Router();

router.post("/", store);

export default router;