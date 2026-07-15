import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { NodeData } from '../../store/useDiagramStore';

export const StickyNoteNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { readOnly, updateNodeData } = useDiagramStore();
  const nodeData = data as NodeData;
  const {
    label,
    stickyColor = 'yellow',
    fontSize = 15,
    textColor,
    fontFamily = 'handwritten',
  } = nodeData;

  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(label);

  useEffect(() => {
    setTempText(label);
  }, [label]);

  // Map color schemes for realistic post-it looks
  const colorMap = {
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/40',
      border: 'border-yellow-200 dark:border-yellow-800/60',
      text: textColor || '#78350f', // amber-900
      shadow: 'shadow-[0_10px_20px_rgba(234,179,8,0.15)]',
    },
    pink: {
      bg: 'bg-pink-100 dark:bg-pink-950/40',
      border: 'border-pink-200 dark:border-pink-800/60',
      text: textColor || '#831843', // pink-900
      shadow: 'shadow-[0_10px_20px_rgba(236,72,153,0.15)]',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/60',
      text: textColor || '#1e3a8a', // blue-900
      shadow: 'shadow-[0_10px_20px_rgba(59,130,246,0.15)]',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-950/40',
      border: 'border-green-200 dark:border-green-800/60',
      text: textColor || '#064e3b', // emerald-950
      shadow: 'shadow-[0_10px_20px_rgba(34,197,94,0.15)]',
    },
  };

  const currentTheme = colorMap[stickyColor] || colorMap.yellow;
  const fontClass = fontFamily === 'handwritten' ? 'font-handwritten text-xl tracking-wide' : 'font-sans';

  const handleClasses = `!w-2 !h-2 !bg-brand-500 border border-white ${readOnly ? '!opacity-0 pointer-events-none' : ''}`;

  return (
    <div
      className={`relative w-full h-full p-6 flex flex-col justify-center items-center border transition-all duration-300 ${currentTheme.bg} ${currentTheme.border} ${currentTheme.shadow} ${selected && !readOnly ? 'scale-[1.02] shadow-2xl ring-2 ring-brand-400' : 'hover:scale-[1.01] hover:shadow-xl'}`}
      style={{
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 90%, 92% 100%, 0% 100%)', // slightly folded bottom-right corner
      }}
    >
      {/* Node Resizer Control */}
      <NodeResizer
        color="#8b5cf6"
        minWidth={100}
        minHeight={100}
        isVisible={!readOnly && !!selected}
        handleClassName="w-2.5 h-2.5 bg-white border-2 border-brand-500 rounded-sm"
      />

      {/* Realistic folded corner paper effect */}
      <div
        className={`absolute bottom-0 right-0 w-4 h-4 border-l border-t transition-colors ${currentTheme.border} bg-white/40 dark:bg-black/40`}
        style={{
          clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
        }}
      />

      {/* Content area / Inline Editor */}
      {isEditing ? (
        <div className="w-full h-full flex items-center justify-center">
          <textarea
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              updateNodeData(id, { label: tempText });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            autoFocus
            className={`nodrag nopan w-full bg-transparent border-none outline-none resize-none text-center focus:ring-0 p-0 ${fontClass}`}
            style={{
              color: currentTheme.text,
              fontSize: `${fontSize}px`,
              lineHeight: '1.4',
            }}
          />
        </div>
      ) : (
        <div
          onDoubleClick={() => { if (!readOnly) setIsEditing(true); }}
          className={`w-full h-full flex items-center justify-center text-center overflow-hidden break-words select-none leading-relaxed ${fontClass}`}
          style={{
            color: currentTheme.text,
            fontSize: `${fontSize}px`,
            whiteSpace: 'pre-wrap',
          }}
        >
          {label}
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="t"
        className={handleClasses}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        className={handleClasses}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="l"
        className={handleClasses}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="r"
        className={handleClasses}
      />
    </div>
  );
};
export default StickyNoteNode;
