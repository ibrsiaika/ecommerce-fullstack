import express from 'express';
import { protect } from '../middleware/auth';
import sellerService from '../services/sellerService';
import { asyncHandler } from '../middleware/appError';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/seller/store
// @desc    Create seller store
// @access  Private
router.post(
  '/store',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const store = await sellerService.createStore(req.user!._id.toString(), req.body);
    sendSuccess(res, 201, store, 'Store created successfully');
  })
);

// @route   GET /api/seller/store
// @desc    Get my store
// @access  Private
router.get(
  '/store',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const store = await sellerService.getStore(req.user!._id.toString());
    sendSuccess(res, 200, store, 'Store retrieved');
  })
);

// @route   PUT /api/seller/store
// @desc    Update my store
// @access  Private
router.put(
  '/store',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const store = await sellerService.updateStore(req.user!._id.toString(), req.body);
    sendSuccess(res, 200, store, 'Store updated successfully');
  })
);

// @route   GET /api/seller/products
// @desc    Get my products
// @access  Private
router.get(
  '/products',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await sellerService.getSellerProducts(
      req.user!._id.toString(),
      page,
      limit
    );
    sendSuccess(res, 200, result, 'Products retrieved');
  })
);

// @route   GET /api/seller/orders
// @desc    Get my orders
// @access  Private
router.get(
  '/orders',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await sellerService.getSellerOrders(
      req.user!._id.toString(),
      page,
      limit
    );
    sendSuccess(res, 200, result, 'Orders retrieved');
  })
);

// @route   GET /api/seller/earnings
// @desc    Get my earnings
// @access  Private
router.get(
  '/earnings',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const earnings = await sellerService.getSellerEarnings(
      req.user!._id.toString(),
      startDate,
      endDate
    );
    sendSuccess(res, 200, earnings, 'Earnings retrieved');
  })
);

// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard
// @access  Private
router.get(
  '/dashboard',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const dashboard = await sellerService.getSellerDashboard(req.user!._id.toString());
    sendSuccess(res, 200, dashboard, 'Dashboard retrieved');
  })
);

// @route   POST /api/seller/withdraw
// @desc    Request withdrawal
// @access  Private
router.post(
  '/withdraw',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { amount, bankDetails } = req.body;
    const withdrawal = await sellerService.requestWithdrawal(
      req.user!._id.toString(),
      amount,
      bankDetails
    );
    sendSuccess(res, 201, withdrawal, 'Withdrawal requested');
  })
);

// @route   GET /api/seller/withdrawals
// @desc    Get withdrawal history
// @access  Private
router.get(
  '/withdrawals',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await sellerService.getWithdrawals(
      req.user!._id.toString(),
      page,
      limit
    );
    sendSuccess(res, 200, result, 'Withdrawals retrieved');
  })
);

// @route   GET /api/seller/store/:slug
// @desc    Get public store profile
// @access  Public
router.get(
  '/store/:slug',
  asyncHandler(async (req, res) => {
    const store = await sellerService.getPublicStore(req.params.slug);
    sendSuccess(res, 200, store, 'Store profile retrieved');
  })
);

// @route   POST /api/seller/follow/:storeId
// @desc    Follow/Unfollow store
// @access  Private
router.post(
  '/follow/:storeId',
  protect,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await sellerService.toggleFollowStore(
      req.user!._id.toString(),
      req.params.storeId
    );
    sendSuccess(res, 200, result, result.following ? 'Store followed' : 'Store unfollowed');
  })
);

export default router;
