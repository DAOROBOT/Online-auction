import categoryService from "../services/category.js";
import authService from "../services/auth.js";

const controller = {
    
    // GET /categories
    listCategories: async function(req, res, next) {
        try {
            const categories = await categoryService.findAll();
            res.json(categories);
        } catch (error) {
            next(error);
        }
    },

    // GET /categories/admin - Get all categories with product counts for admin
    listCategoriesAdmin: async function(req, res, next) {
        try {
            const categories = await categoryService.findAllWithProductCount();
            res.json(categories);
        } catch (error) {
            next(error);
        }
    },

    // POST /categories - Create a new category
    createCategory: async function(req, res, next) {
        try {
            const { name, parentId, description } = req.body;

            if (!name || name.trim() === '') {
                return res.status(400).json({ message: 'Category name is required' });
            }

            // If parentId is provided, verify it exists
            if (parentId) {
                const parentCategory = await categoryService.getById(parentId);
                if (!parentCategory) {
                    return res.status(404).json({ message: 'Parent category not found' });
                }
            }

            const category = await categoryService.create(name.trim(), parentId || null, description || null);
            res.status(201).json({
                message: parentId ? 'Subcategory created successfully' : 'Category created successfully',
                category,
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /categories/:id - Update a category
    updateCategory: async function(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const category = await categoryService.getById(parseInt(id));
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            const updateData = {};
            if (name) updateData.name = name.trim();
            if (description !== undefined) updateData.description = description;

            const updated = await categoryService.update(parseInt(id), updateData);
            res.json({
                message: 'Category updated successfully',
                category: updated,
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /categories/:id - Delete a category
    deleteCategory: async function(req, res, next) {
        try {
            const { id } = req.params;
            const categoryId = parseInt(id);

            const category = await categoryService.getById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }

            // Check if this is a main category (no parentId)
            if (!category.parentId) {
                // This is a main category - check if it has subcategories
                const hasSubcategories = await categoryService.hasSubcategories(categoryId);
                if (hasSubcategories) {
                    // Get all subcategories and check if any have products
                    const subcategories = await categoryService.getSubcategories(categoryId);
                    for (const subcat of subcategories) {
                        const hasProducts = await categoryService.hasProducts(subcat.id);
                        if (hasProducts) {
                            return res.status(400).json({ 
                                message: 'Cannot delete category. Some subcategories have products associated with them.' 
                            });
                        }
                    }
                    // Delete all subcategories first
                    for (const subcat of subcategories) {
                        await categoryService.delete(subcat.id);
                    }
                }

                // Check if main category has direct products
                const hasProducts = await categoryService.hasProducts(categoryId);
                if (hasProducts) {
                    return res.status(400).json({ 
                        message: 'Cannot delete category. It has products associated with it.' 
                    });
                }
            } else {
                // This is a subcategory - check if it has products
                const hasProducts = await categoryService.hasProducts(categoryId);
                if (hasProducts) {
                    return res.status(400).json({ 
                        message: 'Cannot delete subcategory. It has products associated with it.' 
                    });
                }
            }

            await categoryService.delete(categoryId);
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
}

export default controller;