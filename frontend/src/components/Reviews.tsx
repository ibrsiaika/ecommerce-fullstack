import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import api from '../services/api';
import { FiStar, FiUser, FiCalendar, FiEdit3, FiCheck, FiX, FiMessageCircle, FiThumbsUp } from 'react-icons/fi';

interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsProps {
  productId: string;
  reviews: Review[];
  onReviewAdded: () => void;
}

const Reviews: React.FC<ReviewsProps> = ({ productId, reviews = [], onReviewAdded }) => {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setErrorMessage('Please login to add a review');
      setSubmitStatus('error');
      return;
    }

    if (comment.trim().length < 10) {
      setErrorMessage('Please write at least 10 characters in your review');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await api.addProductReview(productId, { rating, comment: comment.trim() });
      
      setRating(5);
      setComment('');
      setShowReviewForm(false);
      setSubmitStatus('success');
      onReviewAdded();
      
      // Auto-hide success message
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to add review. Please try again.';
      setErrorMessage(message);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating] || '';
  };

  // Memoize average rating calculation
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  // Memoize rating distribution with efficient single-pass calculation
  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++;
      }
    });
    
    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: counts[stars],
      percentage: reviews.length > 0 ? (counts[stars] / reviews.length) * 100 : 0
    }));
  }, [reviews]);

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void, size = 'text-xl') => {
    const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            className={`${size} transition-all duration-200 ${
              star <= displayRating 
                ? 'text-amber-400 drop-shadow-sm' 
                : 'text-gray-200'
            } ${interactive ? 'hover:scale-125 cursor-pointer transform' : ''}`}
            disabled={!interactive}
          >
            <FiStar 
              className={star <= displayRating ? 'fill-current' : ''} 
              strokeWidth={star <= displayRating ? 0 : 1.5}
            />
          </button>
        ))}
      </div>
    );
  };

  const userHasReviewed = reviews && reviews.length > 0 && reviews.some(review => review.user === user?.id);

  return (
    <div className="mt-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FiMessageCircle className="w-6 h-6 text-neutral-700" />
            <h3 className="text-2xl font-bold text-neutral-900">Customer Reviews</h3>
          </div>
          <p className="text-neutral-500">
            {reviews.length > 0 
              ? `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}` 
              : 'Be the first to share your thoughts'
            }
          </p>
        </div>
        
        {isAuthenticated && !userHasReviewed && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-lg shadow-neutral-900/20"
          >
            <FiEdit3 className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Success Toast */}
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FiCheck className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Review submitted successfully!</p>
            <p className="text-sm text-green-600">Thank you for sharing your feedback.</p>
          </div>
        </div>
      )}

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-2xl p-6 lg:p-8 mb-10">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center lg:text-left">
              <div className="flex items-baseline justify-center lg:justify-start gap-2 mb-2">
                <span className="text-5xl font-bold text-neutral-900">{averageRating.toFixed(1)}</span>
                <span className="text-xl text-neutral-400">/ 5</span>
              </div>
              <div className="flex justify-center lg:justify-start mb-2">
                {renderStars(Math.round(averageRating), false, undefined, 'text-2xl')}
              </div>
              <p className="text-neutral-500">{reviews.length} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-neutral-600 w-12">{stars} star</span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-10 p-6 lg:p-8 bg-white border-2 border-neutral-200 rounded-2xl shadow-xl shadow-neutral-900/5 animate-slide-down">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-semibold text-neutral-900">Share Your Experience</h4>
            <button
              onClick={() => setShowReviewForm(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmitReview}>
            {/* Rating Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                How would you rate this product?
              </label>
              <div className="flex items-center gap-4">
                {renderStars(rating, true, setRating, 'text-3xl')}
                <span className={`text-lg font-medium transition-all ${
                  hoverRating > 0 || rating > 0 ? 'text-amber-600' : 'text-neutral-400'
                }`}>
                  {getRatingLabel(hoverRating > 0 ? hoverRating : rating)}
                </span>
              </div>
            </div>
            
            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tell us more about your experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/5 transition-all resize-none"
                placeholder="What did you like or dislike? How was the quality? Would you recommend this product?"
                required
                minLength={10}
                maxLength={500}
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-neutral-400">Minimum 10 characters</p>
                <p className={`text-xs ${comment.length > 450 ? 'text-amber-600' : 'text-neutral-400'}`}>
                  {comment.length}/500
                </p>
              </div>
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <FiX className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting || comment.trim().length < 10}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-3 border-2 border-neutral-200 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMessageCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h4 className="text-lg font-semibold text-neutral-900 mb-2">No reviews yet</h4>
          <p className="text-neutral-500 max-w-sm mx-auto">
            Be the first to share your thoughts about this product. Your feedback helps others make better decisions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div 
              key={review._id} 
              className="p-6 bg-white border border-neutral-200 rounded-2xl hover:shadow-lg hover:shadow-neutral-900/5 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-white">{getInitials(review.name)}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <h5 className="font-semibold text-neutral-900">{review.name}</h5>
                      <div className="flex items-center gap-3 mt-1">
                        {renderStars(review.rating, false, undefined, 'text-sm')}
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {getRatingLabel(review.rating)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  <p className="text-neutral-700 leading-relaxed mt-3">{review.comment}</p>
                  
                  {/* Helpful Button */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <button className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
                      <FiThumbsUp className="w-4 h-4" />
                      Helpful
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Share your opinion</p>
              <p className="text-blue-700">
                <a href="/login" className="font-semibold underline underline-offset-2 hover:text-blue-900 transition-colors">
                  Sign in
                </a>{' '}
                to write a review and help others make better choices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message for users who already reviewed */}
      {isAuthenticated && userHasReviewed && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Thank you for your feedback!</p>
              <p className="text-green-700">
                You've already shared your thoughts on this product. Your review helps others make better decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;