import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { useDiagramStore } from '../../store/useDiagramStore';
import type { NodeData } from '../../store/useDiagramStore';

export const CardNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { readOnly, updateNodeData } = useDiagramStore();
  const nodeData = data as NodeData;
  const {
    label,
    description = '',
    status = 'todo',
    priority = 'medium',
    assignee = '',
  } = nodeData;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(label);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(description);

  useEffect(() => {
    setTempTitle(label);
  }, [label]);

  useEffect(() => {
    setTempDesc(description);
  }, [description]);

  // Status mapping
  const statusConfig = {
    'todo': {
      label: 'To Do',
      color: 'bg-slate-500',
      badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-800',
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-blue-500',
      badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
    },
    'review': {
      label: 'In Review',
      color: 'bg-amber-500',
      badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
    },
    'done': {
      label: 'Completed',
      color: 'bg-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
  };

  const priorityConfig = {
    low: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
    medium: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
    high: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30',
  };

  const currentStatus = statusConfig[status] || statusConfig.todo;
  const currentPriorityClass = priorityConfig[priority] || priorityConfig.medium;

  // Extract initials for Assignee Avatar
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleClasses = `!w-2 !h-2 !bg-brand-500 border border-white ${readOnly ? '!opacity-0 pointer-events-none' : ''}`;

  return (
    <div
      className={`relative w-full h-full flex flex-col bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${selected && !readOnly ? 'shadow-lg border-brand-500 ring-2 ring-brand-200 dark:ring-brand-950' : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'}`}
    >
      {/* Node Resizer Control */}
      <NodeResizer
        color="#8b5cf6"
        minWidth={200}
        minHeight={150}
        isVisible={!readOnly && !!selected}
        handleClassName="w-2.5 h-2.5 bg-white border-2 border-brand-500 rounded-sm"
      />

      {/* Top Status Bar indicator */}
      <div className={`w-full h-1.5 ${currentStatus.color}`} />

      {/* Card Content Container */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* Title and Description */}
        <div>
          <div className="flex justify-between items-start gap-2 mb-1.5">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  updateNodeData(id, { label: tempTitle });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                autoFocus
                className="nodrag nopan flex-1 px-1 py-0.5 text-sm font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded outline-none focus:ring-1 focus:ring-brand-500"
              />
            ) : (
              <h4 
                onDoubleClick={() => { if (!readOnly) setIsEditingTitle(true); }}
                className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 select-none flex-1 cursor-text"
              >
                {label}
              </h4>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${currentStatus.badgeBg}`}>
              {currentStatus.label}
            </span>
          </div>

          {isEditingDesc ? (
            <textarea
              rows={2}
              value={tempDesc}
              onChange={(e) => setTempDesc(e.target.value)}
              onBlur={() => {
                setIsEditingDesc(false);
                updateNodeData(id, { description: tempDesc });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              autoFocus
              className="nodrag nopan w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          ) : (
            <p 
              onDoubleClick={() => { if (!readOnly) setIsEditingDesc(true); }}
              className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 select-none leading-relaxed cursor-text"
            >
              {description || 'Double-click to enter details.'}
            </p>
          )}
        </div>

        {/* Footer info (Priority, Assignee) */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
          {/* Priority Badge */}
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${currentPriorityClass}`}>
            {priority}
          </span>

          {/* Assignee Avatar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-[80px] truncate">
              {assignee || 'Unassigned'}
            </span>
            <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/40 flex items-center justify-center text-[10px] font-bold text-brand-700 dark:text-brand-300">
              {getInitials(assignee)}
            </div>
          </div>
        </div>
      </div>

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
export default CardNode;
