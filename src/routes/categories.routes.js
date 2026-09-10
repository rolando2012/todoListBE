import express from "express";
import { destroy, index, show, store, update } from "../controllers/categories.controller.js";

const router = express.Router();

router.post("/", store);
router.get("/", index);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;