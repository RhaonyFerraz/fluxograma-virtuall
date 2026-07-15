import React from 'react';
import { 
  Square, 
  Circle, 
  Triangle, 
  Database, 
  FileText, 
  StickyNote, 
  Layers, 
  KanbanSquare,
  RectangleHorizontal,
  Star,
  ArrowRight,
  ArrowLeft,
  Hexagon,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, extraData?: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (extraData) {
      event.dataTransfer.setData('application/reactflow-extradata', extraData);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  const shapes = [
    { type: 'shape', shape: 'rectangle', label: 'Rectangle', icon: <Square className="w-5 h-5" /> },
    { type: 'shape', shape: 'rounded-rectangle', label: 'Rounded Rect', icon: <RectangleHorizontal className="w-5 h-5" /> },
    { type: 'shape', shape: 'circle', label: 'Circle/Ellipse', icon: <Circle className="w-5 h-5" /> },
    { type: 'shape', shape: 'diamond', label: 'Decision (Diamond)', icon: <div className="w-5 h-5 border-2 border-current rotate-45 transform origin-center scale-75" /> },
    { type: 'shape', shape: 'triangle', label: 'Triangle', icon: <Triangle className="w-5 h-5" /> },
    { type: 'shape', shape: 'cylinder', label: 'Database', icon: <Database className="w-5 h-5" /> },
    { type: 'shape', shape: 'document', label: 'Document', icon: <FileText className="w-5 h-5" /> },
    { type: 'shape', shape: 'parallelogram', label: 'Parallelogram', icon: <div className="w-5 h-5 border-2 border-current -skew-x-12 transform origin-center scale-90" /> },
    { type: 'shape', shape: 'star', label: 'Star', icon: <Star className="w-5 h-5" /> },
    { type: 'shape', shape: 'arrow-right', label: 'Arrow Right', icon: <ArrowRight className="w-5 h-5" /> },
    { type: 'shape', shape: 'arrow-left', label: 'Arrow Left', icon: <ArrowLeft className="w-5 h-5" /> },
    { type: 'shape', shape: 'hexagon', label: 'Hexagon', icon: <Hexagon className="w-5 h-5" /> },
    { type: 'shape', shape: 'pentagon', label: 'Pentagon', icon: <Hexagon className="w-5 h-5 rotate-30" /> },
    { type: 'shape', shape: 'callout', label: 'Speech Callout', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const stickyNotes = [
    { color: 'yellow', label: 'Yellow Note', bg: 'bg-yellow-200 dark:bg-yellow-950/60 border-yellow-300 dark:border-yellow-900/60' },
    { color: 'pink', label: 'Pink Note', bg: 'bg-pink-200 dark:bg-pink-950/60 border-pink-300 dark:border-pink-900/60' },
    { color: 'blue', label: 'Blue Note', bg: 'bg-blue-200 dark:bg-blue-950/60 border-blue-300 dark:border-blue-900/60' },
    { color: 'green', label: 'Green Note', bg: 'bg-green-200 dark:bg-green-950/60 border-green-300 dark:border-green-900/60' },
  ];

  return (
    <aside className="w-72 h-full flex flex-col glass-panel shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10 select-none overflow-y-auto">
      {/* Title */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-violet-400">
          Virtuall Flow
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Drag & drop elements onto the canvas.
        </p>
      </div>

      {/* Shapes Section */}
      <div className="p-4 flex-1 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Flowchart Shapes
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {shapes.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 cursor-grab hover:border-brand-500 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 hover:shadow-sm transition-all duration-200 text-slate-600 dark:text-slate-300 group"
                draggable
                onDragStart={(e) => onDragStart(e, item.type, item.shape)}
              >
                <div className="text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors mb-2">
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-center truncate w-full">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Notes Section */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Sticky Notes
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {stickyNotes.map((note) => (
              <div
                key={note.color}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-grab hover:scale-105 active:scale-95 transition-all shadow-sm ${note.bg}`}
                draggable
                onDragStart={(e) => onDragStart(e, 'sticky', note.color)}
              >
                <StickyNote className="w-5 h-5 opacity-60 mb-1" />
                <span className="text-[11px] font-semibold">{note.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Cards and Group Container */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Templates & Layouts
          </h3>
          <div className="space-y-2">
            {/* Task Card Drag */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 cursor-grab hover:border-brand-500 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 transition-all text-slate-600 dark:text-slate-300"
              draggable
              onDragStart={(e) => onDragStart(e, 'card')}
            >
              <KanbanSquare className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-xs font-semibold">Task/Kanban Card</div>
                <div className="text-[10px] text-slate-400">Rich status & assignee indicators</div>
              </div>
            </div>

            {/* Frame Drag */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/30 dark:bg-slate-900/20 cursor-grab hover:border-brand-500 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 transition-all text-slate-600 dark:text-slate-300"
              draggable
              onDragStart={(e) => onDragStart(e, 'group')}
            >
              <Layers className="w-5 h-5 text-violet-500" />
              <div>
                <div className="text-xs font-semibold">Group Container</div>
                <div className="text-[10px] text-slate-400">Frame visual areas together</div>
              </div>
            </div>

            {/* Image Node Drag */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 cursor-grab hover:border-brand-500 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 transition-all text-slate-600 dark:text-slate-300"
              draggable
              onDragStart={(e) => onDragStart(e, 'image')}
            >
              <ImageIcon className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-xs font-semibold">Image / Screenshot</div>
                <div className="text-[10px] text-slate-400">Embed screenshots & image overlays</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 text-center">
        Tip: Connect nodes by dragging lines between their side handles.
      </div>
    </aside>
  );
};
export default Sidebar;
