import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { NodeData } from '../../store/useDiagramStore';

export const ShapeNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { readOnly, updateNodeData } = useDiagramStore();
  const nodeData = data as NodeData;
  const {
    label,
    shape = 'rectangle',
    color = '#ffffff',
    borderColor = '#94a3b8',
    borderWidth = 2,
    borderStyle = 'solid',
    textColor = '#0f172a',
    fontSize = 14,
    fontWeight = 'normal',
    textAlign = 'center',
    fontFamily = 'sans',
  } = nodeData;

  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(label);

  useEffect(() => {
    setTempText(label);
  }, [label]);

  // Map border style to SVG stroke-dasharray
  let strokeDasharray = '';
  if (borderStyle === 'dashed') {
    strokeDasharray = '6 4';
  } else if (borderStyle === 'dotted') {
    strokeDasharray = '2 3';
  }

  // Draw the SVG shape path based on the selected type using a 0-100 viewBox
  const renderSvgShape = () => {
    const strokeProps = {
      stroke: borderColor,
      strokeWidth: borderWidth,
      strokeDasharray,
      fill: color,
      vectorEffect: 'non-scaling-stroke' as const, // Prevents border stretching when resizing
    };

    switch (shape) {
      case 'rounded-rectangle':
        return (
          <rect
            x={borderWidth / 2}
            y={borderWidth / 2}
            width={100 - borderWidth}
            height={100 - borderWidth}
            rx="12"
            ry="12"
            {...strokeProps}
          />
        );
      case 'circle':
        return (
          <ellipse
            cx="50"
            cy="50"
            rx={50 - borderWidth / 2}
            ry={50 - borderWidth / 2}
            {...strokeProps}
          />
        );
      case 'diamond':
        return (
          <polygon
            points="50,2 98,50 50,98 2,50"
            {...strokeProps}
          />
        );
      case 'triangle':
        return (
          <polygon
            points="50,2 98,98 2,98"
            {...strokeProps}
          />
        );
      case 'cylinder': // Database cylinder
        return (
          <g>
            <path
              d="M 2,15 L 2,85 A 48,12 0 0,0 98,85 L 98,15 A 48,12 0 0,0 2,15 Z"
              {...strokeProps}
            />
            <path
              d="M 2,15 A 48,12 0 0,0 98,15"
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeDasharray={strokeDasharray}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      case 'document':
        return (
          <path
            d="M 2,2 L 75,2 L 98,25 L 98,98 L 2,98 Z M 75,2 L 75,25 L 98,25"
            {...strokeProps}
            style={{ fillRule: 'evenodd' }}
          />
        );
      case 'parallelogram':
        return (
          <polygon
            points="20,2 98,2 80,98 2,98"
            {...strokeProps}
          />
        );
      case 'star':
        return (
          <polygon
            points="50,2 63,35 98,35 70,57 81,91 50,70 19,91 30,57 2,35 37,35"
            {...strokeProps}
          />
        );
      case 'arrow-right':
        return (
          <polygon
            points="2,30 60,30 60,10 98,50 60,90 60,70 2,70"
            {...strokeProps}
          />
        );
      case 'arrow-left':
        return (
          <polygon
            points="98,30 40,30 40,10 2,50 40,90 40,70 98,70"
            {...strokeProps}
          />
        );
      case 'hexagon':
        return (
          <polygon
            points="25,2 75,2 98,50 75,98 25,98 2,50"
            {...strokeProps}
          />
        );
      case 'pentagon':
        return (
          <polygon
            points="50,2 98,38 80,98 20,98 2,38"
            {...strokeProps}
          />
        );
      case 'callout': // Speech bubble / callout
        return (
          <path
            d="M 2,2 L 98,2 L 98,70 L 35,70 L 15,95 L 15,70 L 2,70 Z"
            {...strokeProps}
            style={{ fillRule: 'evenodd' }}
          />
        );
      case 'rectangle':
      default:
        return (
          <rect
            x={borderWidth / 2}
            y={borderWidth / 2}
            width={100 - borderWidth}
            height={100 - borderWidth}
            {...strokeProps}
          />
        );
    }
  };

  // Setup text alignments
  const alignClass = {
    left: 'text-left justify-start',
    center: 'text-center justify-center',
    right: 'text-right justify-end',
  }[textAlign] || 'text-center justify-center';

  const fontClass = fontFamily === 'handwritten' ? 'font-handwritten' : 'font-sans';
  const weightClass = {
    normal: 'font-normal',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[fontWeight] || 'font-normal';

  // Specific padding overrides for shapes to keep text within bounds
  let paddingClass = 'p-3';
  if (shape === 'diamond' || shape === 'star' || shape === 'triangle') {
    paddingClass = 'p-6';
  } else if (shape === 'arrow-right') {
    paddingClass = 'pl-3 pr-8 py-2';
  } else if (shape === 'arrow-left') {
    paddingClass = 'pl-8 pr-3 py-2';
  } else if (shape === 'callout') {
    paddingClass = 'pt-3 pl-3 pr-3 pb-8';
  }

  const handleClasses = `!w-2.5 !h-2.5 !bg-brand-500 border border-white hover:!w-3.5 hover:!h-3.5 ${readOnly ? '!opacity-0 pointer-events-none' : ''}`;

  return (
    <div className="relative w-full h-full min-w-[60px] min-height-[30px] group transition-shadow hover:shadow-md">
      {/* Node Resizer Control */}
      <NodeResizer
        color="#8b5cf6"
        minWidth={60}
        minHeight={30}
        isVisible={!readOnly && !!selected}
        handleClassName="w-2.5 h-2.5 bg-white border-2 border-brand-500 rounded-sm"
      />

      {/* Responsive Shape SVG with non-scaling vectors */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {renderSvgShape()}
      </svg>

      {/* Label Text Overlay / Inline Editor */}
      {isEditing ? (
        <div className={`absolute inset-0 flex items-center ${alignClass} ${paddingClass}`}>
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
            className="nodrag nopan w-full bg-transparent border-none outline-none resize-none text-center focus:ring-0 p-0 text-slate-800 dark:text-slate-200"
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily === 'handwritten' ? 'Caveat, cursive' : 'inherit',
              fontWeight: fontWeight,
              lineHeight: '1.3',
            }}
          />
        </div>
      ) : (
        <div
          onDoubleClick={() => { if (!readOnly) setIsEditing(true); }}
          className={`absolute inset-0 flex items-center select-none ${alignClass} ${fontClass} ${weightClass} ${paddingClass}`}
          style={{
            color: textColor,
            fontSize: `${fontSize}px`,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {label}
        </div>
      )}

      {/* Custom Connect Handles (4 sides) */}
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
export default ShapeNode;
