import React, { useEffect, useState } from 'react';
import { useDiagramStore } from '../store/useDiagramStore';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Calendar,
  Grid,
  FileText,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export const Gallery: React.FC = () => {
  const { 
    diagrams, 
    loadGallery, 
    createNewDiagram, 
    deleteDiagram, 
    renameDiagram 
  } = useDiagramStore();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Dialog states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [templateType, setTemplateType] = useState<'welcome' | 'blank' | 'sap'>('welcome');

  const [showShareModal, setShowShareModal] = useState<string | null>(null); // holds diagram ID to share
  const [showRenameModal, setShowRenameModal] = useState<string | null>(null); // holds diagram ID to rename
  const [renameValue, setRenameValue] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Load gallery list on mount
  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newDiagramName.trim() || `Flowchart ${diagrams.length + 1}`;
    const newId = createNewDiagram(finalName, templateType);
    // Redirect to editor for the new diagram
    window.location.search = `?id=${newId}`;
  };

  const handleEdit = (id: string) => {
    window.location.search = `?id=${id}`;
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteDiagram(id);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showRenameModal && renameValue.trim()) {
      renameDiagram(showRenameModal, renameValue.trim());
      setShowRenameModal(null);
      setRenameValue('');
    }
  };

  // Get sharing links
  const getShareLink = (id: string) => {
    const origin = window.location.origin;
    return `${origin}/?mode=view&id=${id}`;
  };

  const getEmbedCode = (id: string) => {
    const link = getShareLink(id);
    return `<iframe src="${link}" width="100%" height="600px" style="border:1px solid #e2e8f0; border-radius:16px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);" allowfullscreen></iframe>`;
  };

  const copyText = (text: string, type: 'link' | 'embed') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  // Filtered diagrams list based on search query
  const filteredDiagrams = diagrams.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeShareDiagram = diagrams.find(d => d.id === showShareModal);
  const activeRenameDiagram = diagrams.find(d => d.id === showRenameModal);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 p-8 md:p-12 overflow-y-auto">
      
      {/* Gallery Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-6 mb-8 select-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
            Diagram Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Create, manage, and share your flowcharts. Embed each diagram isolated into other systems.
          </p>
        </div>

        {/* Search & Create Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search diagrams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Diagram</span>
          </button>
        </div>
      </header>

      {/* Grid of Diagrams */}
      <main className="max-w-6xl mx-auto">
        {filteredDiagrams.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/40 dark:bg-slate-900/20 text-center select-none">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
              <Grid className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
              No Diagrams Found
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
              {searchQuery ? "No matches found for your search query. Try another keyword." : "You haven't created any flowcharts yet! Create your first one to get started."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Create Diagram
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiagrams.map((diagram) => (
              <div
                key={diagram.id}
                className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-800/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div>
                  {/* Card Header & Title */}
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                      {diagram.name}
                    </h3>
                    <button
                      onClick={() => handleEdit(diagram.id)}
                      title="Open Editor"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Diagram Metadata Stats */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold mb-6">
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-900">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{diagram.nodes.length} Nodes</span>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-900">
                      <Activity className="w-3.5 h-3.5 text-violet-500" />
                      <span>{diagram.edges.length} Links</span>
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(diagram.updatedAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Share Link */}
                    <button
                      onClick={() => setShowShareModal(diagram.id)}
                      title="Share / Embed Link"
                      className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Rename */}
                    <button
                      onClick={() => {
                        setShowRenameModal(diagram.id);
                        setRenameValue(diagram.name);
                      }}
                      title="Rename"
                      className="p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(diagram.id, diagram.name)}
                      title="Delete Flowchart"
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE NEW DIAGRAM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Create New Flowchart
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Flowchart Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales Pipeline, User Login Flow"
                  value={newDiagramName}
                  onChange={(e) => setNewDiagramName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Choose Template
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateType('welcome')}
                    className={`p-2 py-3 rounded-xl border text-center transition-all text-[11px] ${templateType === 'welcome' ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 text-brand-700 dark:text-brand-300 font-bold' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-505 dark:text-slate-400'}`}
                  >
                    🚀 Welcome Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateType('blank')}
                    className={`p-2 py-3 rounded-xl border text-center transition-all text-[11px] ${templateType === 'blank' ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 text-brand-700 dark:text-brand-300 font-bold' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-505 dark:text-slate-400'}`}
                  >
                    ⬜ Blank Slate
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateType('sap')}
                    className={`p-2 py-3 rounded-xl border text-center transition-all text-[11px] ${templateType === 'sap' ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10 text-brand-700 dark:text-brand-300 font-bold' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-505 dark:text-slate-400'}`}
                  >
                    📊 SAP Admin
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm shadow-brand-500/20"
              >
                Create and Open
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENAME DIAGRAM MODAL */}
      {showRenameModal && activeRenameDiagram && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRenameSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Rename Flowchart
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRenameModal(null);
                  setRenameValue('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  New Title
                </label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setShowRenameModal(null);
                  setRenameValue('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm shadow-brand-500/20"
              >
                Rename
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SHARE / EMBED MODAL */}
      {showShareModal && activeShareDiagram && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Share / Embed "{activeShareDiagram.name}"
                </h3>
                <p className="text-xs text-slate-400">
                  Deploy this diagram to a platform. Viewers will only see the read-only diagram.
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Direct View Link */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Isolated View URL
                  </label>
                  <button
                    onClick={() => copyText(getShareLink(activeShareDiagram.id), 'link')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied URL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-900 text-xs font-mono select-all truncate text-slate-600 dark:text-slate-300">
                  {getShareLink(activeShareDiagram.id)}
                </div>
              </div>

              {/* Iframe Embed Code */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Iframe Embed Code (HTML)
                  </label>
                  <button
                    onClick={() => copyText(getEmbedCode(activeShareDiagram.id), 'embed')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {copiedEmbed ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied Embed Code!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Embed Code</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={getEmbedCode(activeShareDiagram.id)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-900 text-xs font-mono text-slate-600 dark:text-slate-300 select-all resize-none focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => setShowShareModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Gallery;
