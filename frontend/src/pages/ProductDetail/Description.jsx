import { useState } from 'react';
import { Type, Plus, Save, X, Eye, Pencil, Calendar } from 'lucide-react';
// Import the Tiptap component
import RichTextEditor from '../../components/RichTextEditor';

// Mock product data with initial description
const mockProduct = {
  id: 1,
  description: `<h2>Exceptional Vintage Timepiece</h2>
<p>This <strong>1980 Rolex Submariner 1680</strong> represents a pinnacle of horological excellence. The watch features the iconic red "Submariner" text on the dial, making it highly sought after by collectors worldwide.</p>
<ul>
  <li><strong>Reference:</strong> 1680</li>
  <li><strong>Year:</strong> 1980</li>
  <li><strong>Case:</strong> 40mm stainless steel</li>
</ul>`,
  // New field to store append-only updates
  updates: [
    {
      id: 101,
      timestamp: new Date('2025-10-31T10:00:00'),
      content: '<p>The original box has a slight tear on the corner. Please check image #4.</p>'
    }
  ]
};

export default function Description() {
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [description] = useState(mockProduct.description); // Original description is read-only
  const [updates, setUpdates] = useState(mockProduct.updates); // List of updates
  const [newUpdateContent, setNewUpdateContent] = useState(''); // Content for the new update

  const handleSaveUpdate = () => {
    if (!newUpdateContent || newUpdateContent === '<p></p>') return;

    const newUpdate = {
      id: Date.now(),
      timestamp: new Date(),
      content: newUpdateContent
    };

    setUpdates([...updates, newUpdate]);
    setNewUpdateContent('');
    setIsAddingUpdate(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', { // dd/mm/yyyy format
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--accent-soft)' }}>
              <Type size={24} style={{ color: 'var(--accent)' }} />
            </div>
            Product Description
          </h2>
        </div>
        
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {isAddingUpdate ? 'Append new details to the listing' : 'Original description and subsequent updates'}
        </p>
      </div>

      {/* Content Card */}
      <div className="rounded-2xl border overflow-hidden bg-(--card-bg) border-(--border) shadow-(--card-shadow)">
        <div className="p-6 md:p-8 space-y-8">

          {/* 1. ORIGINAL DESCRIPTION (Read Only) */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest opacity-70 px-2 py-1 rounded bg-(--bg-subtle) text-(--text-muted) border border-(--border)">
                Original Listing
              </span>

              {/* Toggle Button: Add Info vs Cancel */}
              {!isAddingUpdate ? (
                <button
                  onClick={() => setIsAddingUpdate(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-md"
                  style={{ 
                    backgroundColor: 'var(--accent)',
                    color: '#1A1205'
                  }}>
                  <Plus size={18} />
                  Add Info
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingUpdate(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: 'var(--bg-soft)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}>
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUpdate}
                    disabled={!newUpdateContent || newUpdateContent === '<p></p>'}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: 'var(--success)',
                      color: 'white'
                    }}>
                    <Save size={18} />
                    Save Update
                  </button>
                </div>
              )}
            </div>
            <div 
              className="prose-custom text-(--text)"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          {/* 2. UPDATES LIST (Append History) */}
          {updates.length > 0 && (
            <div className="border-t pt-8 border-(--border)">
              {updates.map((update) => (
                <div key={update.id} className="mb-8 last:mb-0 relative pl-4 border-l-2 border-(--accent)">
                  {/* Timestamp Header */}
                  <div className="flex items-center gap-2 mb-3 text-(--accent) font-bold">
                    <span className="text-xl">✏️</span> 
                    <span className="text-lg">{formatDate(update.timestamp)}</span>
                  </div>
                  
                  {/* Update Content */}
                  <div 
                    className="prose-custom opacity-90 pl-1"
                    dangerouslySetInnerHTML={{ __html: update.content }}
                    style={{ color: 'var(--text)' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 3. EDITOR (Only visible when adding) */}
          {isAddingUpdate && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 border-t border-(--border) pt-8">
              <div className="mb-2 flex items-center gap-2 font-bold text-(--text)">
                <Pencil size={16} /> 
                New Update Entry
              </div>
              <RichTextEditor 
                value={newUpdateContent} 
                onChange={setNewUpdateContent} 
              />
            </div>
          )}

          </div>
      </div>

      {/* Custom Styles (Preserved) */}
      <style>{`
        .prose-custom {
          max-width: none;
          line-height: 1.75;
        }
        .prose-custom h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          color: var(--text);
        }
        .prose-custom p {
          margin-bottom: 0.75rem;
          color: var(--text);
        }
        .prose-custom strong {
          font-weight: 700;
          color: var(--accent);
        }
        .prose-custom ul {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        .prose-custom li {
          margin-bottom: 0.25rem;
          color: var(--text);
        }
        .prose-custom li::marker {
          color: var(--accent);
        }
      `}</style>

    </div>
  );
}