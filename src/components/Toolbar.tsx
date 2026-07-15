import React, { useRef, useState } from 'react';
import { 
  Undo2, 
  Redo2, 
  Lock, 
  Unlock, 
  Grid, 
  Grid3X3,
  EyeOff,
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Code,
  Trash2,
  Sun,
  Moon,
  Copy,
  Check,
  X,
  LayoutGrid
} from 'lucide-react';
import { useDiagramStore } from '../store/useDiagramStore';
import { toPng } from 'html-to-image';

export const Toolbar: React.FC = () => {
  const {
    nodes,
    edges,
    lockCanvas,
    gridType,
    past,
    future,
    currentName,
    undo,
    redo,
    setLockCanvas,
    setGridType,
    saveToLocalStorage,
    loadFromLocalStorage,
    importJson,
    exportJson,
    clearCanvas,
    saveActiveDiagram
  } = useDiagramStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for export JSON modal
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Alert toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    saveToLocalStorage();
    showToast('💾 Diagram saved successfully!');
  };

  const handleLoad = () => {
    loadFromLocalStorage();
    showToast('📂 Diagram loaded successfully!');
  };

  const handleBackToGallery = () => {
    // Auto save changes before exit
    saveActiveDiagram();
    // Return to dashboard
    window.location.search = '';
  };

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setDarkMode(isDark);
    showToast(isDark ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
  };

  // Export Canvas to PNG
  const handleExportPng = () => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;
    
    // Select handles to temporarily hide them for clean export
    const handles = document.querySelectorAll('.react-flow__handle');
    handles.forEach(h => h.classList.add('opacity-0'));
    
    showToast('📸 Rendering diagram PNG...');
    
    toPng(viewport, {
      backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
      style: {
        transform: 'scale(1)',
      },
      width: viewport.clientWidth,
      height: viewport.clientHeight,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${currentName.replace(/\s+/g, '-').toLowerCase() || 'diagram'}.png`;
        link.href = dataUrl;
        link.click();
        
        // Restore handles
        handles.forEach(h => h.classList.remove('opacity-0'));
        showToast('✅ Downloaded PNG image successfully!');
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
        handles.forEach(h => h.classList.remove('opacity-0'));
        showToast('❌ Failed to export PNG image');
      });
  };

  // Handle JSON Import
  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const success = importJson(result);
      if (success) {
        showToast('🧩 JSON Diagram Imported successfully!');
      } else {
        showToast('❌ Invalid diagram JSON schema!');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  // Copy JSON scheme
  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON File
  const handleDownloadJson = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentName.replace(/\s+/g, '-').toLowerCase() || 'flowchart'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('📥 Downloaded flowchart JSON schema!');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the canvas? This will reset all nodes.')) {
      clearCanvas();
      showToast('🗑️ Canvas cleared.');
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 text-xs font-semibold rounded-full shadow-2xl z-50 border border-slate-700/50 dark:border-white/10 flex items-center gap-2 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFileSelect}
        accept=".json"
        className="hidden"
      />

      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-20 flex items-center justify-between gap-4 px-5 py-3 rounded-2xl glass-panel shadow-xl w-[90%] max-w-4xl border border-slate-200/80 dark:border-slate-800/80 select-none">
        
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToGallery}
            title="Return to Dashboard Gallery"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 font-bold text-xs transition-colors border-r border-slate-200 dark:border-slate-800 pr-3"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[120px] sm:max-w-[180px] truncate border-r border-slate-200 dark:border-slate-800 pr-3 block">
            {currentName}
          </span>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl+Y)"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Lock & Grid Toggles */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3">
          <button
            onClick={() => {
              setLockCanvas(!lockCanvas);
              showToast(lockCanvas ? '🔓 Canvas Unlocked (Editing Active)' : '🔒 Canvas Locked (Read-Only Mode)');
            }}
            title={lockCanvas ? 'Unlock Canvas' : 'Lock Canvas'}
            className={`p-2 rounded-lg transition-colors ${lockCanvas ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
          >
            {lockCanvas ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              const types: ('dots' | 'lines' | 'off')[] = ['dots', 'lines', 'off'];
              const nextIdx = (types.indexOf(gridType) + 1) % types.length;
              setGridType(types[nextIdx]);
              showToast(`Grid: ${types[nextIdx].toUpperCase()}`);
            }}
            title={`Toggle Grid (Current: ${gridType})`}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            {gridType === 'dots' && <Grid className="w-4 h-4" />}
            {gridType === 'lines' && <Grid3X3 className="w-4 h-4" />}
            {gridType === 'off' && <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Save / Load / Clear */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3">
          <button
            onClick={handleSave}
            title="Backup to Local Storage"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleLoad}
            title="Restore from Local Storage"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            title="Clear Canvas"
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Integration API Tools: JSON & Image Exports */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3 font-semibold">
          <button
            onClick={() => setShowJsonModal(true)}
            title="Show & Export JSON Schema"
            className="p-2 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors flex items-center gap-1 text-xs"
          >
            <Code className="w-4 h-4" />
            <span className="hidden md:inline">JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload/Import JSON Schema"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportPng}
            title="Export Board as PNG"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={handleToggleDarkMode}
          title="Toggle Dark Mode"
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-violet-600" />}
        </button>
      </div>

      {/* JSON Schema Slide Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Django Integration JSON Schema
                </h3>
                <p className="text-xs text-slate-400">
                  This pure JSON structure matches standard React Flow nodes & edges schema.
                </p>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Code Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed relative">
              <pre className="overflow-x-auto whitespace-pre-wrap select-all">
                {exportJson()}
              </pre>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60">
              <div className="text-xs text-slate-400">
                Nodes: {nodes.length} | Edges: {edges.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-755 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm shadow-brand-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Toolbar;
