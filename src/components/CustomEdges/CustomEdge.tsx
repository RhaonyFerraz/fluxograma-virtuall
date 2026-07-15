import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { useDiagramStore } from '../../store/useDiagramStore';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}) => {
  const { readOnly } = useDiagramStore();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    const store = useDiagramStore.getState();
    store.takeSnapshot();
    useDiagramStore.setState({
      edges: store.edges.filter((edge) => edge.id !== id),
    });
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected && !readOnly ? 3.5 : 2.5,
          stroke: selected && !readOnly ? '#8b5cf6' : style.stroke || '#94a3b8',
        }}
      />
      
      {/* Edge controls / labels using portal rendering */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan select-none flex items-center gap-1.5"
        >
          {label && (
            <div className="px-2 py-1 text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded shadow-sm">
              {label}
            </div>
          )}
          
          {selected && !readOnly && (
            <button
              onClick={handleDelete}
              title="Delete Connection"
              className="w-5 h-5 flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md text-xs font-bold transition-all duration-200 hover:scale-110"
            >
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
export default CustomEdge;
