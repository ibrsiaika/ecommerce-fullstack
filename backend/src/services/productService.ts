import Product, { IProduct } from '../models/Product';
import { AppError } from '../middleware/appError';

export class ProductService {
  async getAll(
    page: number = 1,
    limit: number = 20,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('reviews.user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id: string) {
    const product = await Product.findById(id)
      .populate('reviews.user', 'name email avatar');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async getBySlug(slug: string) {
    const product = await Product.findOne({ slug })
      .populate('reviews.user', 'name email avatar');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async create(data: Partial<IProduct>) {
    // Check if product with same SKU exists
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) {
      throw new AppError('Product with this SKU already exists', 400);
    }

    const product = await Product.create(data);
    return product;
  }

  async update(id: string, data: Partial<IProduct>) {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async delete(id: string) {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async addReview(
    productId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string
  ) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      r => r.user.toString() === userId
    );

    if (existingReview) {
      // Keep the wording consistent with the REST layer
      throw new AppError('Product already reviewed', 400);
    }

    product.reviews.push({
      user: userId as any,
      name: userName,
      rating,
      comment,
      createdAt: new Date()
    });

    // Update product rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.numReviews = product.reviews.length;

    await product.save();
    return product;
  }

  async getFeatured(limit: number = 8) {
    return Product.find({ isFeatured: true, isActive: true })
      .sort({ rating: -1 })
      .limit(limit);
  }

  async getCategories() {
    return Product.distinct('category', { isActive: true });
  }

  async getBrands() {
    return Product.distinct('brand', { isActive: true });
  }

  async searchProducts(query: string, limit: number = 10) {
    return Product.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);
  }
}

export default new ProductService();
