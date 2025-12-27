import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import Comment from './Comment';

export default function CommentsSection({ comments, setComments }) {
  const [comment, setComment] = useState('');

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      // const newComment = await productService.addComment(product.id, comment);
      const newComment = {
        id: Date.now(),
        user: 'You',
        avatar: 'https://i.pravatar.cc/150?u=you',
        text: comment,
        time: 'Just now',
      };
      setComments([newComment, ...comments]);
      setComment('');
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleReply = async (commentId, replyText) => {
    // In a real app, you would call an API like: productService.replyToComment(commentId, replyText)
    // Here we simulate the state update
    const newReply = {
      id: `reply-${Date.now()}`,
      user: 'You (Owner)', // Simulating owner reply
      avatar: 'https://i.pravatar.cc/150?u=owner',
      text: replyText,
      time: 'Just now',
      isOwner: true 
    };

    const updatedComments = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    setComments(updatedComments);
  };

  return (
    <div className="rounded-2xl p-6 bg-(--bg-soft) border border-(--border)">
      <h3 className="text-xl text-(--text) font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h3>
      
      {/* Main Comment Input */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
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

      {/* Comments List */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pb-2 custom-scrollbar">
        {comments && comments.length > 0 ? (
          comments.map((commentItem) => (
            <Comment 
              key={commentItem.id} 
              comment={commentItem} 
              onReplySubmit={handleReply}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-muted)' }}>No comments yet. Be the first to ask!</p>
          </div>
        )}
      </div>
    </div>
  );
}