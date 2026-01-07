import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import Comment from './Comment';
import auctionService from '../../services/auctionService';

export default function CommentsSection({ productId }) {
  // State quản lý danh sách comment và trạng thái loading
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý ô nhập liệu (Giữ lại từ file gốc)
  const [commentText, setCommentText] = useState('');

  // 1. Fetch dữ liệu thật từ Backend 
  useEffect(() => {
    const fetchComments = async () => {
        try {
            const data = await auctionService.getComments(productId);
            // Nếu API trả về mảng thì lấy, không thì rỗng
            setComments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoading(false);
        }
    };
    if (productId) fetchComments();
  }, [productId]);

  // 2. Logic thêm comment mới 
  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      // TODO: Gọi API post comment thật ở đây (auctionService.addComment...)
      // Hiện tại giả lập thêm vào danh sách hiển thị để UI mượt mà
      const newComment = {
        id: Date.now(),
        user: 'You',
        avatar: 'https://ui-avatars.com/api/?name=You&background=random',
        content: commentText, // Sửa 'text' thành 'content' cho khớp schema chung
        text: commentText,    // Giữ cả field cũ để tránh lỗi component con
        time: 'Just now',
        replies: []
      };
      
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    }
  };

  // 3. Logic trả lời comment (Giữ lại & điều chỉnh)
  const handleReply = async (commentId, replyText) => {
    // Giả lập reply 
    const newReply = {
      id: `reply-${Date.now()}`,
      user: 'You (Owner)',
      avatar: 'https://ui-avatars.com/api/?name=Owner&background=000&color=fff',
      content: replyText,
      text: replyText,
      time: 'Just now',
      isOwner: true 
    };

    // Cập nhật state lồng nhau (Nested update)
    setComments(prevComments => 
      prevComments.map(c => 
        c.id === commentId 
          ? { ...c, replies: [...(c.replies || []), newReply] } 
          : c
      )
    );
  };

  if (loading) return <div className="h-40 bg-gray-100 animate-pulse rounded-xl mt-8"></div>;

  return (
    <div className="bg-[var(--bg-soft)] rounded-2xl p-8 border border-[var(--border)] shadow-sm mt-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text)]">
        <MessageSquare size={20} className="text-[var(--accent)]" />
        Q&A / Comments ({comments.length})
      </h3>
      
      {/* INPUT KHUNG NHẬP LIỆU */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleComment()}
          placeholder="Ask a question or leave a comment..."
          className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          style={{ 
            backgroundColor: 'var(--bg)', 
            borderColor: 'var(--border)', 
            color: 'var(--text)' 
          }}
        />
        <button
          onClick={handleComment}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* DANH SÁCH COMMENTS */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pb-2 custom-scrollbar">
        {comments && comments.length > 0 ? (
          comments.map((commentItem) => (
            <Comment 
              key={commentItem.id || Math.random()} 
              comment={commentItem} 
              onReplySubmit={handleReply}
            />
          ))
        ) : (
          <p className="text-center text-[var(--text-muted)] py-4">No comments yet. Be the first to ask!</p>
        )}
      </div>
    </div>
  );
}