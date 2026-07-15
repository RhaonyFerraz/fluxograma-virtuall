import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react';

import { useDiagramStore } from './store/useDiagramStore';
import type { NodeData } from './store/useDiagramStore';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { NodeInspector } from './components/NodeInspector';
import { Gallery } from './components/Gallery';

// Custom Nodes and Edges Imports
import { ShapeNode } from './components/CustomNodes/ShapeNode';
import { StickyNoteNode } from './components/CustomNodes/StickyNoteNode';
import { CardNode } from './components/CustomNodes/CardNode';
import { GroupNode } from './components/CustomNodes/GroupNode';
import { ImageNode } from './components/CustomNodes/ImageNode';
import { CustomEdge } from './components/CustomEdges/CustomEdge';

// Register node types
const nodeTypes = {
  shape: ShapeNode,
  sticky: StickyNoteNode,
  card: CardNode,
  group: GroupNode,
  image: ImageNode,
};

// Register edge types
const edgeTypes = {
  custom: CustomEdge,
};

const FlowCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    gridType,
    readOnly,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    saveActiveDiagram,
    takeSnapshot,
  } = useDiagramStore();

  const { screenToFlowPosition } = useReactFlow();

  // Drag over handler
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop handler
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (readOnly) return; // Prevent dropping new nodes when in read-only

      const type = event.dataTransfer.getData('application/reactflow');
      const extraData = event.dataTransfer.getData('application/reactflow-extradata');

      // Check if dropped element is valid
      if (!type) return;

      // Project screen coordinates to React Flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Construct starting customData overrides
      const customData: Partial<NodeData> = {};
      if (type === 'shape' && extraData) {
        customData.shape = extraData as NodeData['shape'];
      } else if (type === 'sticky' && extraData) {
        customData.stickyColor = extraData as NodeData['stickyColor'];
      }

      addNode(type, position, customData);
    },
    [screenToFlowPosition, addNode, readOnly]
  );

  // Double click pane handler to spawn a node quickly
  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    if (readOnly) return;
    
    const target = event.target as HTMLElement;
    // Verify target is background pane or grid element
    if (
      target.classList.contains('react-flow__pane') ||
      target.classList.contains('react-flow__background') ||
      target.tagName === 'svg' ||
      target.closest('.react-flow__background')
    ) {
      // Project coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode('shape', position, { 
        label: 'New Shape', 
        shape: 'rounded-rectangle',
        color: '#ffffff',
        borderColor: '#94a3b8'
      });
    }
  }, [screenToFlowPosition, addNode, readOnly]);

  return (
    <div 
      onDoubleClick={onPaneDoubleClick}
      className="flex-1 h-full relative overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      {/* Floating Action Toolbar - Hidden in read-only mode */}
      {!readOnly && <Toolbar />}

      {/* Main Flow Editor */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'custom' }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStart={() => takeSnapshot()} // Save snapshot when dragging starts
        onNodeDragStop={() => saveActiveDiagram()} // Auto-save on dragging completion
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        nodesFocusable={!readOnly}
        edgesFocusable={!readOnly}
        zoomOnDoubleClick={false} // Disable default zoom to let event bubble
        className="w-full h-full"
      >
        {/* Toggleable grid overlay */}
        {gridType !== 'off' && (
          <Background
            variant={gridType === 'lines' ? BackgroundVariant.Lines : BackgroundVariant.Dots}
            gap={20}
            size={gridType === 'lines' ? 1 : 1.5}
            className="opacity-50 dark:opacity-30"
          />
        )}

        <Controls showInteractive={!readOnly} />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
};

export const App: React.FC = () => {
  const { 
    setReadOnly, 
    loadGallery, 
    loadDiagram, 
    deleteSelected, 
    undo, 
    redo 
  } = useDiagramStore();

  const [route, setRoute] = useState<'gallery' | 'editor' | 'view' | 'not-found'>('gallery');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initialise and load diagrams list from storage
    loadGallery();

    // 2. Routing checks based on URL params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const isView = params.get('mode') === 'view';

    if (id) {
      const success = loadDiagram(id);
      if (success) {
        if (isView) {
          setReadOnly(true);
          setRoute('view');
        } else {
          setReadOnly(false);
          setRoute('editor');
        }
      } else {
        setRoute('not-found');
      }
    } else {
      setRoute('gallery');
    }
    setLoading(false);
  }, [loadGallery, loadDiagram, setReadOnly]);

  // Keyboard Shortcuts (Only active if in Editor mode)
  useEffect(() => {
    if (route !== 'editor') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [route, deleteSelected, undo, redo]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 select-none">
        <div className="text-sm font-semibold animate-pulse text-slate-400">
          Loading Virtuall Flow...
        </div>
      </div>
    );
  }

  if (route === 'gallery') {
    return <Gallery />;
  }

  if (route === 'not-found') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 select-none">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm text-center shadow-xl">
          <h3 className="text-lg font-bold text-rose-500 mb-2">Diagram Not Found</h3>
          <p className="text-xs text-slate-405 dark:text-slate-400 leading-relaxed mb-6">
            The flowchart you are trying to view does not exist or has been deleted from the system.
          </p>
          <button
            onClick={() => { window.location.search = ''; }}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-all hover:shadow-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Editor or Viewer Mode Canvas rendering
  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-800 dark:text-slate-200">
      <ReactFlowProvider>
        {route === 'editor' && <Sidebar />}
        <FlowCanvas />
        {route === 'editor' && <NodeInspector />}
      </ReactFlowProvider>
    </div>
  );
};

export default App;
