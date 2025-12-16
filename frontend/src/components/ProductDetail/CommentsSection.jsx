import { MessageSquare, Send } from 'lucide-react';

export default function CommentsSection({ comments, comment, onCommentChange, onCommentSubmit }) {
  return (
    <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <MessageSquare className="w-5 h-5" />
        Comments
      </h3>
      
      {/* Comment Input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onCommentSubmit()}
          placeholder="Ask a question or leave a comment..."
          className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{ 
            backgroundColor: 'var(--bg)', 
            borderColor: 'var(--border)', 
            color: 'var(--text)' 
          }}
        />
        <button
          onClick={onCommentSubmit}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map((commentItem) => (
            <div key={commentItem.id} className="flex gap-3">
              <img 
                src={commentItem.avatar} 
                alt={commentItem.user}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {commentItem.user}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {commentItem.time}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>{commentItem.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }} className="text-center py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
}
