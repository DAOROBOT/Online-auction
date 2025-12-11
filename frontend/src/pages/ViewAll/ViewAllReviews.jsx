import { useState } from "react";
import { Star, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { mockUserData } from "../../data/users";

export default function ViewAllReviews({ darkMode, toggleDarkMode }) {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    
    const reviews = mockUserData.reviews || [];
    
    // Calculate rating stats
    const positiveReviews = reviews.filter(r => r.type === 'positive').length;
    const negativeReviews = reviews.filter(r => r.type === 'negative').length;
    const averageRating = mockUserData.rating?.percentage || 0;
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };
    
    // Apply filters
    const filteredReviews = reviews.filter(review => {
        if (ratingFilter !== 'all' && review.type !== ratingFilter) return false;
        return true;
    });

    return (
        <>
            <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} />
                        <span>Back to Profile</span>
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--text)' }}>
                            <Star size={32} style={{ color: 'var(--warning)' }} />
                            Reviews & Ratings
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>See what others say about you</p>
                    </div>

                    {/* Rating Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-8 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-soft)' }}>
                            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
                                {averageRating}%
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                        key={star} 
                                        size={20} 
                                        fill={star <= Math.floor(averageRating / 20) ? 'var(--warning)' : 'none'}
                                        style={{ color: 'var(--warning)' }} 
                                    />
                                ))}
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Based on {reviews.length} reviews
                            </p>
                        </div>
                        
                        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)', borderLeft: '4px solid var(--success)' }}>
                            <div className="flex items-center gap-3">
                                <ThumbsUp size={24} style={{ color: 'var(--success)' }} />
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Positive Reviews</p>
                                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{positiveReviews}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)', borderLeft: '4px solid var(--danger)' }}>
                            <div className="flex items-center gap-3">
                                <ThumbsDown size={24} style={{ color: 'var(--danger)' }} />
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Negative Reviews</p>
                                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{negativeReviews}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {['all', 'positive', 'negative'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setRatingFilter(filter)}
                                className="px-4 py-2 rounded-lg font-medium transition-all"
                                style={{
                                    backgroundColor: ratingFilter === filter ? 'var(--accent)' : 'var(--bg-soft)',
                                    color: ratingFilter === filter ? 'var(--bg)' : 'var(--text)',
                                    border: ratingFilter === filter ? 'none' : '1px solid var(--border)'
                                }}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {filteredReviews.length === 0 ? (
                            <div className="text-center py-16 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)' }}>
                                <MessageSquare size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>No Reviews Yet</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Complete transactions to receive reviews</p>
                            </div>
                        ) : (
                            filteredReviews.map(review => (
                                <div key={review.id} className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
                                                <span className="font-bold" style={{ color: 'var(--accent)' }}>
                                                    {review.from.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold" style={{ color: 'var(--text)' }}>{review.from}</p>
                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                    {formatDate(review.date)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {review.type === 'positive' ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" 
                                                      style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>
                                                    <ThumbsUp size={12} />
                                                    Positive
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" 
                                                      style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}>
                                                    <ThumbsDown size={12} />
                                                    Negative
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="mb-3" style={{ color: 'var(--text)' }}>
                                        {review.comment}
                                    </p>
                                    
                                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                        <span>Product:</span>
                                        <span className="font-medium" style={{ color: 'var(--accent)' }}>
                                            {review.productTitle}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
