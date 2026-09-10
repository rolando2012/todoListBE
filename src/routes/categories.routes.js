import express from "express";
import { index, show, store, update } from "../controllers/categories.controller.js";

const router = express.Router();

router.post("/", store);
router.get("/", index);
router.get("/:id", show);
router.put("/:id", update);

export default router;