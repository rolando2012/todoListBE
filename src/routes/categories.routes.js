import express from "express";
import { index, show, store } from "../controllers/categories.controller.js";

const router = express.Router();

router.post("/", store);
router.get("/", index);
router.get("/:id", show);

export default router;