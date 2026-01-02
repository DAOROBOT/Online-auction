import { Router } from "express";

import categoryController from "../controllers/category.js"

const route = new Router();

// GET: All Categories (public)
route.get('/', categoryController.listCategories);

// GET: All Categories with product counts (admin)
route.get('/admin', categoryController.listCategoriesAdmin);

// POST: Create a new category (admin)
route.post('/', categoryController.createCategory);

// PUT: Update a category (admin)
route.put('/:id', categoryController.updateCategory);

// DELETE: Delete a category (admin)
route.delete('/:id', categoryController.deleteCategory);

export default route;