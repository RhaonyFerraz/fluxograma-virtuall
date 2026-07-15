import React from 'react';
import { useDiagramStore } from '../store/useDiagramStore';
import type { NodeData } from '../store/useDiagramStore';
import { 
  Activity, 
  Settings
} from 'lucide-react';

export const NodeInspector: React.FC = () => {
  const { nodes, edges, updateNodeData } = useDiagramStore();

  const selectedNode = nodes.find((n) => n.selected);
  const selectedEdge = edges.find((e) => e.selected);

  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="w-80 h-full flex flex-col justify-center items-center p-6 glass-panel border-l border-slate-200 dark:border-slate-800 z-10 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 animate-pulse">
          <Settings className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
          No Element Selected
        </h4>
        <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
          Select a shape, sticky note, task card, or connection line to configure styling.
        </p>
      </aside>
    );
  }

  // Pre-configured premium color palettes (background colors)
  const colors = [
    { hex: '#ffffff', name: 'White' },
    { hex: '#f8fafc', name: 'Slate Light' },
    { hex: '#f1f5f9', name: 'Slate Gray' },
    { hex: '#e0e7ff', name: 'Indigo Light' },
    { hex: '#dbeafe', name: 'Blue Light' },
    { hex: '#e0f2fe', name: 'Sky Light' },
    { hex: '#d1fae5', name: 'Emerald Light' },
    { hex: '#fee2e2', name: 'Rose Light' },
    { hex: '#ffedd5', name: 'Orange Light' },
    { hex: '#fef9c3', name: 'Yellow Light' },
    // Solid colors
    { hex: '#6366f1', name: 'Indigo' },
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#ef4444', name: 'Rose' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#eab308', name: 'Yellow' },
    { hex: 'transparent', name: 'None' },
  ];

  // Border colors
  const borderColors = [
    { hex: '#cbd5e1', name: 'Slate-300' },
    { hex: '#94a3b8', name: 'Slate-500' },
    { hex: '#64748b', name: 'Slate-600' },
    { hex: '#8b5cf6', name: 'Purple-500' },
    { hex: '#6366f1', name: 'Indigo-500' },
    { hex: '#3b82f6', name: 'Blue-500' },
    { hex: '#10b981', name: 'Emerald-500' },
    { hex: '#ef4444', name: 'Rose-500' },
    { hex: '#f97316', name: 'Orange-500' },
  ];

  // Sticky note color schemes
  const stickyColors: ('yellow' | 'pink' | 'blue' | 'green')[] = ['yellow', 'pink', 'blue', 'green'];

  // Handle Edge Property Updates
  const handleEdgeUpdate = (updatedProps: Record<string, unknown>) => {
    if (!selectedEdge) return;
    useDiagramStore.setState((state) => ({
      edges: state.edges.map((e) => {
        if (e.id === selectedEdge.id) {
          const newEdge = { ...e, ...updatedProps };
          if (updatedProps.color) {
            newEdge.style = { ...e.style, stroke: updatedProps.color as string };
          }
          if (updatedProps.animated !== undefined) {
            newEdge.animated = updatedProps.animated as boolean;
          }
          if (updatedProps.dashed !== undefined) {
            newEdge.style = { 
              ...e.style, 
              strokeDasharray: updatedProps.dashed ? '6 4' : undefined 
            };
          }
          return newEdge;
        }
        return e;
      }),
    }));
  };

  // Render Edge Inspector
  if (selectedEdge) {
    const strokeColor = selectedEdge.style?.stroke || '#94a3b8';
    const isAnimated = !!selectedEdge.animated;
    const isDashed = !!selectedEdge.style?.strokeDasharray;

    return (
      <aside className="w-80 h-full flex flex-col p-6 glass-panel border-l border-slate-200 dark:border-slate-800 z-10 overflow-y-auto select-none">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Connection Style
          </h2>
        </div>

        <div className="space-y-6">
          {/* Edge Label */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Connection Label
            </label>
            <input
              type="text"
              value={(selectedEdge.label as string) || ''}
              onChange={(e) => handleEdgeUpdate({ label: e.target.value })}
              placeholder="e.g. Yes / No, Data Flow"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Edge Animation */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Animated Flow</span>
              <span className="text-[10px] text-slate-400">Animate dashes indicating direction</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnimated}
                onChange={(e) => handleEdgeUpdate({ animated: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Edge Dash Style */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Dashed Connection</span>
              <span className="text-[10px] text-slate-400">Use dashed line instead of solid</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDashed}
                onChange={(e) => handleEdgeUpdate({ dashed: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Stroke Colors */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Line Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {borderColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handleEdgeUpdate({ color: color.hex })}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  className={`w-8 h-8 rounded-lg border-2 hover:scale-105 active:scale-95 transition-all ${strokeColor === color.hex ? 'border-brand-500 scale-105 ring-2 ring-brand-200' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // TypeScript assertion: since we checked (!selectedNode && !selectedEdge) at the top,
  // and handled `selectedEdge` above, `selectedNode` MUST be defined if execution reaches here.
  if (!selectedNode) return null;

  // Render Node Inspector
  const nodeData = selectedNode.data as NodeData;
  const isShape = selectedNode.type === 'shape';
  const isSticky = selectedNode.type === 'sticky';
  const isCard = selectedNode.type === 'card';
  const isImage = selectedNode.type === 'image';

  return (
    <aside className="w-80 h-full flex flex-col p-6 glass-panel border-l border-slate-200 dark:border-slate-800 z-10 overflow-y-auto select-none">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <Settings className="w-5 h-5 text-brand-500" />
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
            {selectedNode.type} Node
          </h2>
          <span className="text-[10px] text-slate-400">ID: {selectedNode.id}</span>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Node Content / Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {isCard ? 'Task Title' : isSticky ? 'Sticky Note text' : 'Label / text'}
          </label>
          {isSticky || isCard ? (
            <textarea
              rows={4}
              value={nodeData.label}
              onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-sans"
            />
          ) : (
            <input
              type="text"
              value={nodeData.label}
              onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          )}
        </div>

        {/* Card Specific Fields */}
        {isCard && (
          <>
            {/* Card Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={nodeData.description || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={nodeData.status || 'todo'}
                onChange={(e) => updateNodeData(selectedNode.id, { status: e.target.value as 'todo' | 'in-progress' | 'review' | 'done' })}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Completed</option>
              </select>
            </div>

            {/* Priority and Assignee */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <select
                  value={nodeData.priority || 'medium'}
                  onChange={(e) => updateNodeData(selectedNode.id, { priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Assignee
                </label>
                <input
                  type="text"
                  value={nodeData.assignee || ''}
                  onChange={(e) => updateNodeData(selectedNode.id, { assignee: e.target.value })}
                  placeholder="Initials / Name"
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Image Node Specific Controls */}
        {isImage && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Image Source URL
              </label>
              <input
                type="text"
                value={(nodeData.imageUrl as string) || ''}
                onChange={(e) => updateNodeData(selectedNode.id, { imageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Upload Screenshot File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-28 border border-slate-200 dark:border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 transition-colors">
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    <svg className="w-6 h-6 mb-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">Click to upload</span> image
                    </p>
                    <p className="text-[8px] text-slate-400 mt-0.5">PNG, JPG, SVG (Max 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateNodeData(selectedNode.id, {
                            imageUrl: event.target?.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {nodeData.imageUrl && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => updateNodeData(selectedNode.id, { imageUrl: '' })}
                  className="w-full py-1.5 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* Shape Specific Type Selector */}
        {isShape && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Shape Type
            </label>
            <select
              value={nodeData.shape || 'rectangle'}
              onChange={(e) => updateNodeData(selectedNode.id, { shape: e.target.value as NodeData['shape'] })}
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="rectangle">Rectangle</option>
              <option value="rounded-rectangle">Rounded Rectangle</option>
              <option value="circle">Circle / Ellipse</option>
              <option value="diamond">Diamond (Decision)</option>
              <option value="triangle">Triangle</option>
              <option value="cylinder">Database / Cylinder</option>
              <option value="document">Document</option>
              <option value="parallelogram">Parallelogram</option>
              <option value="star">Star</option>
              <option value="arrow-right">Arrow Right</option>
              <option value="arrow-left">Arrow Left</option>
              <option value="hexagon">Hexagon</option>
              <option value="pentagon">Pentagon</option>
              <option value="callout">Speech Callout</option>
            </select>
          </div>
        )}

        {/* Sticky Note Colors */}
        {isSticky && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Sticky Note Color
            </label>
            <div className="flex gap-3">
              {stickyColors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateNodeData(selectedNode.id, { stickyColor: color })}
                  className={`w-9 h-9 rounded-full border-2 hover:scale-110 transition-transform shadow-sm
                    ${color === 'yellow' ? 'bg-yellow-200 border-yellow-300' : ''}
                    ${color === 'pink' ? 'bg-pink-200 border-pink-300' : ''}
                    ${color === 'blue' ? 'bg-blue-200 border-blue-300' : ''}
                    ${color === 'green' ? 'bg-green-200 border-green-300' : ''}
                    ${nodeData.stickyColor === color ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'border-transparent'}
                  `}
                />
              ))}
            </div>
          </div>
        )}

        {/* Styling Panel (Shapes & Groups & Cards) */}
        {!isSticky && !isCard && !isImage && (
          <>
            {/* Background Colors Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Background Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => updateNodeData(selectedNode.id, { color: c.hex })}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    className={`w-7 h-7 rounded-lg border-2 hover:scale-105 transition-all ${nodeData.color === c.hex ? 'border-brand-500 scale-105 shadow-sm ring-1 ring-brand-200' : 'border-slate-200 dark:border-slate-800'}`}
                  />
                ))}
              </div>
            </div>

            {/* Borders Config */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Border Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {borderColors.map((bc) => (
                    <button
                      key={bc.hex}
                      onClick={() => updateNodeData(selectedNode.id, { borderColor: bc.hex })}
                      style={{ backgroundColor: bc.hex }}
                      title={bc.name}
                      className={`w-7 h-7 rounded-lg border-2 hover:scale-105 transition-all ${nodeData.borderColor === bc.hex ? 'border-brand-500 scale-105 ring-1 ring-brand-200' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono">
                    Border Width ({nodeData.borderWidth ?? 2}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={nodeData.borderWidth ?? 2}
                    onChange={(e) => updateNodeData(selectedNode.id, { borderWidth: parseInt(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Border Style
                  </label>
                  <select
                    value={nodeData.borderStyle || 'solid'}
                    onChange={(e) => updateNodeData(selectedNode.id, { borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Typography settings (Shapes & Sticky Notes & Groups) */}
        {!isCard && !isImage && (
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Typography
            </h3>
            
            <div className="space-y-4">
              {/* Font Size & Font Family */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                    Font Family
                  </label>
                  <select
                    value={nodeData.fontFamily || (isSticky ? 'handwritten' : 'sans')}
                    onChange={(e) => updateNodeData(selectedNode.id, { fontFamily: e.target.value as 'sans' | 'handwritten' })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="sans">Sans-Serif</option>
                    <option value="handwritten">Handwritten</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                    Font Size ({nodeData.fontSize ?? (isSticky ? 15 : 14)}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    step="1"
                    value={nodeData.fontSize ?? (isSticky ? 15 : 14)}
                    onChange={(e) => updateNodeData(selectedNode.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                </div>
              </div>

              {/* Text Align & Font Weight (Only Shapes and Groups) */}
              {!isSticky && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                      Font Weight
                    </label>
                    <select
                      value={nodeData.fontWeight || 'normal'}
                      onChange={(e) => updateNodeData(selectedNode.id, { fontWeight: e.target.value as 'normal' | 'semibold' | 'bold' })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                      Text Align
                    </label>
                    <select
                      value={nodeData.textAlign || 'center'}
                      onChange={(e) => updateNodeData(selectedNode.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
