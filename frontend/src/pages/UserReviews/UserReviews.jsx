import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, User } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import userService from '../../services/userService';
import Pagination from '../../components/Pagination';
import './UserReviews.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function UserReviews() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'given'
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    positiveReviews: 0,
    negativeReviews: 0,
    positivePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/users/profile?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUserData();
  }, [username]);

  // Fetch reviews
  useEffect(() => {
    if (!userData?.id) return;
    fetchReviews();
  }, [userData, activeTab, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (activeTab === 'received') {
        filterParams.targetId = userData.id;
      } else {
        filterParams.reviewerId = userData.id;
      }

      const response = await reviewService.getReviews(filterParams);

      if (response.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-(--text-muted)">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={userData.avatar} 
            alt={userData.name} 
            className="w-16 h-16 rounded-full border-4 border-(--border)"
          />
          <div>
            <h1 className="text-3xl font-bold text-(--text)">{userData.name}'s Reviews</h1>
            <p className="text-(--text-muted)">@{userData.username}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-xl bg-(--card-bg) border border-(--border) text-center">
          <div className="text-3xl font-bold text-(--text) mb-2">{stats.totalReviews}</div>
          <div className="text-sm text-(--text-muted) uppercase tracking-wide">Total Reviews</div>
        </div>
        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.positiveReviews}</div>
          <div className="text-sm text-(--text-muted) uppercase tracking-wide">Positive</div>
        </div>
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{stats.negativeReviews}</div>
          <div className="text-sm text-(--text-muted) uppercase tracking-wide">Negative</div>
        </div>
        <div className="p-6 rounded-xl bg-(--accent)/10 border border-(--accent)/20 text-center">
          <div className="text-3xl font-bold text-(--accent) mb-2">{stats.positivePercentage}%</div>
          <div className="text-sm text-(--text-muted) uppercase tracking-wide">Positive Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-(--border) mb-8">
        <button
          onClick={() => {
            setActiveTab('received');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className={`pb-4 px-6 font-bold transition-colors relative ${
            activeTab === 'received'
              ? 'text-(--text)'
              : 'text-(--text-muted) hover:text-(--text)'
          }`}
        >
          Reviews Received
          {activeTab === 'received' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-(--accent)" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('given');
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className={`pb-4 px-6 font-bold transition-colors relative ${
            activeTab === 'given'
              ? 'text-(--text)'
              : 'text-(--text-muted) hover:text-(--text)'
          }`}
        >
          Reviews Given
          {activeTab === 'given' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-(--accent)" />
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-(--text-muted)">Loading reviews...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto mb-4 text-(--text-muted) opacity-50" />
          <p className="text-(--text-muted)">No reviews {activeTab === 'received' ? 'received' : 'given'} yet.</p>
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className="space-y-4 mb-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 rounded-xl bg-(--card-bg) border border-(--border) hover:border-(--accent)/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        activeTab === 'received'
                          ? review.revieweravatarurl || '/default-avatar.png'
                          : review.targetavatarurl || '/default-avatar.png'
                      }
                      alt="User"
                      className="w-12 h-12 rounded-full border-2 border-(--border)"
                    />
                    <div>
                      <h3 className="font-bold text-(--text)">
                        {activeTab === 'received'
                          ? review.reviewerfullname || review.reviewerusername
                          : review.targetfullname || review.targetusername}
                      </h3>
                      <p className="text-sm text-(--text-muted)">
                        @{activeTab === 'received' ? review.reviewerusername : review.targetusername}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                      review.isGoodRating
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {review.isGoodRating ? (
                      <>
                        <ThumbsUp size={16} />
                        <span>Positive</span>
                      </>
                    ) : (
                      <>
                        <ThumbsDown size={16} />
                        <span>Negative</span>
                      </>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-(--text) mb-4 pl-16">{review.comment}</p>
                )}

                <div className="flex items-center gap-6 text-sm text-(--text-muted) pl-16">
                  {review.auctiontitle && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Auction:</span>
                      <span>{review.auctiontitle}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{formatDate(review.createdat)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            />
          )}
        </>
      )}
    </div>
  );
}
