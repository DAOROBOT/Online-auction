import { Router } from "express";

import categoryController from "../controllers/category.js"

const route = new Router();

// GET: All Categories
route.get('/', categoryController.listCategories);



export default route;