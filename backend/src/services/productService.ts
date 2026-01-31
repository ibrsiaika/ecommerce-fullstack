import Product, { IProduct } from '../models/Product';
import Order from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

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
        .populate('reviews.user', 'firstName lastName email avatar')
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
      .populate('reviews.user', 'firstName lastName email avatar');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async getBySlug(slug: string) {
    const product = await Product.findOne({ slug })
      .populate('reviews.user', 'firstName lastName email avatar');

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
    comment: string,
    photos: string[] = [],
    isVerifiedPurchase: boolean = false
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

    // cap photos at 5 even if client sends more
    const safePhotos = (photos || []).slice(0, 5);

    product.reviews.push({
      user: userId as any,
      name: userName,
      rating,
      comment,
      photos: safePhotos,
      helpfulVotes: 0,
      votedBy: [],
      isVerifiedPurchase: !!isVerifiedPurchase
    } as any);

    // Update product rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / product.reviews.length;
    product.numReviews = product.reviews.length;

    await product.save();
    return product;
  }

  // Check if a user has a paid, delivered order containing this product.
  // Used to mark reviews as "verified purchase".
  async checkVerifiedPurchase(productId: string, userId: string): Promise<boolean> {
    const count = await Order.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      isPaid: true,
      orderStatus: 'delivered',
      'orderItems.product': new mongoose.Types.ObjectId(productId)
    });
    return count > 0;
  }

  // Mark a review as helpful. A user can vote once per review.
  async voteReviewHelpful(productId: string, reviewId: string, userId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = (product.reviews as any).id(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // can't vote on your own review
    if (review.user.toString() === userId) {
      throw new AppError('Cannot vote on your own review', 400);
    }

    const votedBy = review.get('votedBy') || [];
    const alreadyVoted = votedBy.some(
      (u: mongoose.Types.ObjectId) => u.toString() === userId
    );
    if (alreadyVoted) {
      throw new AppError('You have already voted on this review', 400);
    }

    votedBy.push(new mongoose.Types.ObjectId(userId));
    review.set('votedBy', votedBy);
    review.set('helpfulVotes', (review.get('helpfulVotes') || 0) + 1);
    review.markModified('votedBy');
    review.markModified('helpfulVotes');

    await product.save();
    return product;
  }

  // Seller or admin replies to a review. Only the product owner or an admin
  // may reply, and only once per review.
  async replyToReview(
    productId: string,
    reviewId: string,
    replierId: string,
    replierRole: string,
    comment: string
  ) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = (product.reviews as any).id(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.get('sellerReply')) {
      throw new AppError('Review already has a seller reply', 400);
    }

    // only the product's seller or an admin can reply
    const isSeller = replierRole === 'seller' || replierRole === 'admin' || replierRole === 'super_admin';
    if (!isSeller) {
      throw new AppError('Only the seller or admin may reply to a review', 403);
    }

    review.set('sellerReply', {
      comment,
      repliedAt: new Date(),
      repliedBy: new mongoose.Types.ObjectId(replierId)
    });
    review.markModified('sellerReply');

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
