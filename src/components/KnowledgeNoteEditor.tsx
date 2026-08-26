import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Heading1, 
  Heading2, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Link as LinkIcon, 
  Save, 
  Send, 
  ArrowLeft
} from 'lucide-react';

export const KnowledgeNoteEditor: React.FC = () => {
  const { db, currentUser, setCurrentTab, triggerRefresh, refreshKey } = useApp();

  const [noteId, setNoteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Programming');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');

  const categories = [
    'Programming',
    'AI / ML',
    'Web Development',
    'Backend',
    'Frontend',
    'DevOps',
    'Cloud',
    'Cybersecurity',
    'Projects',
    'Career',
    'Interview Preparation',
    'Company Knowledge',
    'Other'
  ];

  // Load existing note if set in localStorage
  useEffect(() => {
    const savedId = localStorage.getItem('nexora_editor_note_id');
    if (savedId) {
      const existing = db.getKnowledgeNotes().find(n => n.id === savedId);
      if (existing) {
        setNoteId(existing.id);
        setTitle(existing.title);
        setCategory(existing.category);
        setTags(existing.tags.join(', '));
        setCoverImage(existing.coverImage || '');
        setContent(existing.content);
        return;
      }
    }
    // Clean form for new note
    setNoteId(null);
    setTitle('');
    setCategory('Programming');
    setTags('');
    setCoverImage('');
    setContent('');
  }, [refreshKey]); // Triggers reload on parent refresh signals

  // Toolbar markdown inserts
  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selection = text.substring(start, end);

    let replacement = syntax;
    if (syntax === '**' || syntax === '*') {
      replacement = `${syntax}${selection || 'text'}${syntax}`;
    } else if (syntax === 'code') {
      replacement = `\n\`\`\`javascript\n${selection || '// code content'}\n\`\`\`\n`;
    } else if (syntax === 'link') {
      replacement = `[${selection || 'link text'}](https://url.com)`;
    } else {
      replacement = `${syntax}${selection || 'heading'}`;
    }

    setContent(before + replacement + after);
    
    // Focus back on textarea after slight timeout
    setTimeout(() => {
      textarea.focus();
      const newPos = start + replacement.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const handleSave = (status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED') => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill out both Title and Content fields before saving.');
      return;
    }

    const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);

    // Determine final status based on user role
    // Interns and Employees require Admin moderation. Admins and Mentors publish directly.
    let finalStatus = status;
    if (status === 'PUBLISHED' && currentUser.role !== 'ADMIN') {
      finalStatus = 'PENDING_APPROVAL';
    }

    if (noteId) {
      // Edit existing note
      const existing = db.getKnowledgeNotes().find(n => n.id === noteId);
      if (existing) {
        db.updateKnowledgeNote(
          {
            ...existing,
            title,
            content,
            category,
            tags: tagsArr,
            coverImage: coverImage || undefined,
            status: finalStatus
          },
          currentUser.email,
          currentUser.name
        );
      }
    } else {
      // Create new note
      db.createKnowledgeNote(
        {
          title,
          content,
          authorId: currentUser.email,
          authorName: currentUser.name,
          category,
          tags: tagsArr,
          coverImage: coverImage || undefined,
          status: finalStatus
        },
        currentUser.email,
        currentUser.name
      );
    }

    // Clean editor target key
    localStorage.removeItem('nexora_editor_note_id');
    triggerRefresh();

    if (finalStatus === 'PENDING_APPROVAL') {
      alert('Your note has been submitted for Admin approval. You will receive an in-app notification when approved.');
    } else {
      alert(finalStatus === 'DRAFT' ? 'Draft saved successfully!' : 'Article published successfully!');
    }

    setCurrentTab('library');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
      
      {/* Editor sub-header actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            localStorage.removeItem('nexora_editor_note_id');
            setCurrentTab('library');
          }}
          className="flex items-center text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold"
        >
          <ArrowLeft size={14} className="mr-1" /> Discard & Return
        </button>

        <div className="flex space-x-2.5">
          <button
            onClick={() => handleSave('DRAFT')}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold flex items-center"
          >
            <Save size={14} className="mr-1.5" /> Save Draft
          </button>
          
          <button
            onClick={() => handleSave('PUBLISHED')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all"
          >
            <Send size={14} className="mr-1.5" /> 
            {currentUser.role === 'ADMIN' ? 'Publish Article' : 'Submit for Approval'}
          </button>
        </div>
      </div>

      {/* Editor Board Sheet */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
        
        {/* Document Info row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Article Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Node.js, Express, REST"
              className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

        </div>

        {/* Cover Image link */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cover Image URL (Optional)</label>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/photo-xxx"
            className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Note Title Input */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Article Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Setting up Docker Compose for local React-TS environments"
            className="w-full px-3 py-3 font-heading font-extrabold text-base md:text-lg border-b border-slate-100 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder-slate-350"
          />
        </div>

        {/* Markdown Editor Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={() => insertMarkdown('## ')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Header 2"
          >
            <Heading1 size={14} />
          </button>
          <button 
            type="button" 
            onClick={() => insertMarkdown('### ')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Header 3"
          >
            <Heading2 size={14} />
          </button>
          
          <span className="w-px h-5 bg-slate-200 dark:bg-slate-750 mx-1"></span>

          <button 
            type="button" 
            onClick={() => insertMarkdown('**')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Bold Text"
          >
            <Bold size={14} />
          </button>
          <button 
            type="button" 
            onClick={() => insertMarkdown('*')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Italic Text"
          >
            <Italic size={14} />
          </button>

          <span className="w-px h-5 bg-slate-200 dark:bg-slate-750 mx-1"></span>

          <button 
            type="button" 
            onClick={() => insertMarkdown('* ')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Bullet list"
          >
            <List size={14} />
          </button>
          <button 
            type="button" 
            onClick={() => insertMarkdown('1. ')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Numbered list"
          >
            <ListOrdered size={14} />
          </button>

          <span className="w-px h-5 bg-slate-200 dark:bg-slate-750 mx-1"></span>

          <button 
            type="button" 
            onClick={() => insertMarkdown('code')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Code Block"
          >
            <Code size={14} />
          </button>
          <button 
            type="button" 
            onClick={() => insertMarkdown('link')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
            title="Hyperlink"
          >
            <LinkIcon size={14} />
          </button>
        </div>

        {/* Main Textarea */}
        <div>
          <textarea
            id="note-textarea"
            required
            rows={15}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article contents here. Markdown syntax is supported for headings, bold/italic, code blocks, lists, and links..."
            className="w-full p-4 text-xs md:text-sm rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue font-sans leading-relaxed"
          />
        </div>

      </div>

    </div>
  );
};
