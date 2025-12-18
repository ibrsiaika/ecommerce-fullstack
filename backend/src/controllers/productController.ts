import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import { asyncHandler, AppError } from '../middleware/appError';
import productService from '../services/productService';
import { sendPaginatedSuccess, sendSuccess, sendValidationError } from '../utils/response';

const mapProductPreview = (product: any) => ({
  _id: product._id,
  id: product._id,
  name: product.name,
  description: product.description,
  slug: product.slug,
  price: product.price,
  comparePrice: product.comparePrice,
  category: product.category,
  brand: product.brand,
  image: product.images?.[0],
  images: product.images,
  rating: product.rating,
  numReviews: product.numReviews,
  countInStock: product.countInStock,
  sku: product.sku,
  isFeatured: product.isFeatured,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

const parseNumber = (value?: string | string[], fallback: number = 0) => {
  if (!value) return fallback;
  const parsed = Array.isArray(value) ? parseFloat(value[0]) : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// @desc    Get all products with filtering, search, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 12, 50);

  const { products, pagination } = await productService.getAll(
    page,
    limit,
    req.query.category as string,
    parseNumber(req.query.minPrice as string),
    parseNumber(req.query.maxPrice as string),
    req.query.search as string
  );

  const curated = products.map(mapProductPreview);
  return sendPaginatedSuccess(res, 200, curated, pagination.page, pagination.limit, pagination.total, 'Products loaded');
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id);
  return sendSuccess(res, 200, mapProductPreview(product));
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array().map(err => err.msg));
  }

  const product = await productService.create({
    ...req.body,
    user: (req as any).user?.id
  });

  return sendSuccess(res, 201, mapProductPreview(product), 'Product created');
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array().map(err => err.msg));
  }

  const updatedProduct = await productService.update(req.params.id, req.body);
  return sendSuccess(res, 200, mapProductPreview(updatedProduct), 'Product updated');
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.delete(req.params.id);
  return sendSuccess(res, 200, null, 'Product deleted successfully');
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await productService.getCategories();
  return sendSuccess(res, 200, categories);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 8, 24);
  const products = await productService.getFeatured(limit);
  return sendSuccess(res, 200, products.map(mapProductPreview));
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addProductReview = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array().map(err => err.msg));
  }

  const user = (req as any).user;
  if (!user) {
    throw new AppError('Unauthorized', 401);
  }

  const product = await productService.addReview(
    req.params.id,
    user.id,
    user.name,
    Number(req.body.rating),
    req.body.comment
  );

  return sendSuccess(
    res,
    201,
    {
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews
    },
    'Review added successfully'
  );
});

// Validation rules for product creation/update
export const productValidation = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
  
  body('category')
    .notEmpty()
    .withMessage('Product category is required'),
  
  body('countInStock')
    .isInt({ min: 0 })
    .withMessage('Count in stock must be a non-negative integer'),
  
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),
  
  body('sku')
    .optional()
    .isLength({ min: 3 })
    .withMessage('SKU must be at least 3 characters long')
];

// Validation rules for product review
export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ max: 500 })
    .withMessage('Review comment cannot exceed 500 characters')
];
