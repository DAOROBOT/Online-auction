import { Router } from "express";
import systemController from "../controllers/system.js"
const route = new Router();

// GET: Live System Stats
route.get('/live-stats', systemController.getLiveStats);

export default route;