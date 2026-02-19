import express from "express";
import * as controller from "../controllers/controller.js";
const router = express.Router();

router.get("/api/dashboard/panel/:panelId", controller.getDashboardData);

export default router;
