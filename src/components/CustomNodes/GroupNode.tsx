import React from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { NodeData } from '../../store/useDiagramStore';

export const GroupNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { readOnly } = useDiagramStore();
  const nodeData = data as NodeData;
  const {
    label,
    color = 'rgba(241, 245, 249, 0.2)', // translucent fill
    borderColor = '#cbd5e1', // slate-300
    borderWidth = 2,
    borderStyle = 'dashed',
    textColor = '#475569',
    fontSize = 13,
    fontWeight = 'semibold',
  } = nodeData;

  const fontStyle = {
    color: textColor,
    fontSize: `${fontSize}px`,
  };

  // Map border style to tailwind styles
  const borderStyleClass = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  }[borderStyle] || 'border-dashed';

  const weightClass = {
    normal: 'font-normal',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[fontWeight] || 'font-semibold';

  const handleClasses = `!w-2 !h-2 !bg-brand-400 border border-white opacity-20 hover:opacity-100 transition-opacity ${readOnly ? '!opacity-0 pointer-events-none' : ''}`;

  return (
    <div
      className={`relative w-full h-full rounded-2xl transition-all duration-300 ${borderStyleClass} ${selected && !readOnly ? 'ring-2 ring-brand-500 border-brand-500' : ''}`}
      style={{
        backgroundColor: color,
        borderColor: borderColor,
        borderWidth: `${borderWidth}px`,
      }}
    >
      {/* Node Resizer Control */}
      <NodeResizer
        color="#8b5cf6"
        minWidth={150}
        minHeight={100}
        isVisible={!readOnly && !!selected}
        handleClassName="w-2.5 h-2.5 bg-white border-2 border-brand-500 rounded-sm"
      />

      {/* Group Title Area */}
      <div className="absolute top-3 left-4 select-none pointer-events-none">
        <span
          className={`uppercase tracking-wider ${weightClass}`}
          style={fontStyle}
        >
          {label}
        </span>
      </div>

      {/* Subtle connect handles for referencing groups */}
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
