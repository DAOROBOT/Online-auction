import { Router } from "express";

import searchController from "../controllers/search.js"

const route = new Router();

// GET: Search Auctions
route.get('/', searchController.searchAuctions);

export default route;