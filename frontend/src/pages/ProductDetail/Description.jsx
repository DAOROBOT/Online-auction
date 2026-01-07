import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import auctionService from '../../services/auctionService';

export default function Description({ productId }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu thật từ Backend
  useEffect(() => {
    const fetchDesc = async () => {
        try {
            const data = await auctionService.getDescription(productId);
            // Backend trả về object { description: "HTML content..." }
            setContent(data.description || "<p>No description provided for this item.</p>");
        } catch (err) {
            console.error("Error fetching description:", err);
            setContent("<p>Failed to load description.</p>");
        } finally {
            setLoading(false);
        }
    };
    if (productId) fetchDesc();
  }, [productId]);

  if (loading) return <div className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>;

  return (
    <div className="bg-[var(--bg-soft)] rounded-2xl p-8 border border-[var(--border)] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--text)]">
            <FileText className="text-[var(--accent)]" />
            Description
        </h2>
      </div>

      <div className="prose-custom">
          <div 
              className="text-[var(--text-muted)]"
              dangerouslySetInnerHTML={{ __html: content }}
          />
      </div>

      <style>{`
        .prose-custom {
          max-width: none;
          line-height: 1.75;
        }
        .prose-custom h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-top: 1.5em;
          margin-bottom: 0.75rem;
          color: var(--text);
        }
        .prose-custom h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.25em;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .prose-custom p {
          margin-bottom: 1rem;
          color: var(--text-muted);
        }
        .prose-custom strong {
          font-weight: 700;
          color: var(--text); /* Hoặc var(--accent) nếu muốn nổi bật */
        }
        .prose-custom ul {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          list-style-type: disc;
          padding-left: 1.5rem;
          color: var(--text-muted);
        }
        .prose-custom li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}