import React from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { NodeData } from '../../store/useDiagramStore';
import { Image as ImageIcon } from 'lucide-react';

export const ImageNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { readOnly } = useDiagramStore();
  const nodeData = data as NodeData;
  const imageUrl = nodeData.imageUrl as string;

  const handleClasses = `!w-2 !h-2 !bg-brand-500 border border-white ${readOnly ? '!opacity-0 pointer-events-none' : ''}`;

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${selected && !readOnly ? 'shadow-lg border-brand-500 ring-2 ring-brand-200 dark:ring-brand-950' : 'hover:shadow-md border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40'}`}
    >
      {/* Node Resizer Control */}
      <NodeResizer
        color="#8b5cf6"
        minWidth={80}
        minHeight={60}
        isVisible={!readOnly && !!selected}
        handleClassName="w-2.5 h-2.5 bg-white border-2 border-brand-500 rounded-sm"
      />

      {/* Main Image content or Empty Placeholder */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={nodeData.label || "Flowchart Screenshot"}
          className="w-full h-full object-contain pointer-events-none rounded-xl"
        />
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-850 rounded-xl select-none">
          <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-1.5 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Screenshot / Image</span>
          <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 max-w-[120px] leading-relaxed">
            Select this node and use the inspector panel to upload an image.
          </span>
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
export default ImageNode;
