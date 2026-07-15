import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';

// Custom data shape for our nodes
export interface NodeData extends Record<string, unknown> {
  label: string;
  shape?: 'rectangle' | 'rounded-rectangle' | 'circle' | 'diamond' | 'triangle' | 'cylinder' | 'document' | 'parallelogram' | 'star' | 'arrow-right' | 'arrow-left' | 'hexagon' | 'pentagon' | 'callout';
  color?: string; // bg color (hex or tailwind class)
  borderColor?: string; // border color
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderWidth?: number;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  stickyColor?: 'yellow' | 'pink' | 'blue' | 'green';
  fontFamily?: 'sans' | 'handwritten';
  imageUrl?: string; // ImageNode specific url
  // Card specific fields
  description?: string;
  status?: 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  // Group specific fields
  width?: number;
  height?: number;
}

// Structure of a saved diagram in our gallery
export interface SavedDiagram {
  id: string;
  name: string;
  updatedAt: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export interface DiagramState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  lockCanvas: boolean;
  gridType: 'dots' | 'lines' | 'off';
  readOnly: boolean;
  
  // Gallery Management
  diagrams: SavedDiagram[];
  currentId: string | null;
  currentName: string;
  
  // History for undo/redo
  past: { nodes: Node<NodeData>[]; edges: Edge[] }[];
  future: { nodes: Node<NodeData>[]; edges: Edge[] }[];
  
  // Handlers for React Flow
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  
  // Diagram actions
  addNode: (type: string, position: { x: number; y: number }, customData?: Partial<NodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  updateNodeDimensions: (nodeId: string, width: number, height: number) => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  
  // Canvas settings
  setLockCanvas: (lock: boolean) => void;
  setGridType: (type: 'dots' | 'lines' | 'off') => void;
  setReadOnly: (read: boolean) => void;
  
  // History operations
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  
  // Persistence & Gallery Actions
  loadGallery: () => void;
  createNewDiagram: (name: string, templateType?: 'welcome' | 'blank' | 'sap') => string;
  loadDiagram: (id: string) => boolean;
  saveActiveDiagram: () => void;
  deleteDiagram: (id: string) => void;
  renameDiagram: (id: string, name: string) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  importJson: (jsonString: string) => boolean;
  exportJson: () => string;
  setNodesAndEdges: (nodes: Node<NodeData>[], edges: Edge[]) => void;
}

// Helper to deep clone nodes and edges
const cloneState = (nodes: Node<NodeData>[], edges: Edge[]) => {
  return {
    nodes: JSON.parse(JSON.stringify(nodes)) as Node<NodeData>[],
    edges: JSON.parse(JSON.stringify(edges)) as Edge[],
  };
};

const getDefaultWelcomeNodes = (): Node<NodeData>[] => [
  {
    id: 'welcome-1',
    type: 'shape',
    position: { x: 250, y: 150 },
    data: {
      label: 'Welcome to Virtuall Flow!',
      shape: 'rounded-rectangle',
      color: '#e0e7ff', // indigo-100
      borderColor: '#6366f1', // indigo-500
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#1e1b4b', // indigo-950
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 250,
    height: 80,
  },
  {
    id: 'welcome-2',
    type: 'sticky',
    position: { x: 580, y: 120 },
    data: {
      label: '💡 Sticky note!\nDouble-click to edit.\nDrag shapes from the left bar to create flows!',
      stickyColor: 'yellow',
      fontFamily: 'handwritten',
      fontSize: 15,
      textColor: '#78350f', // amber-900
    },
    width: 200,
    height: 200,
  },
  {
    id: 'welcome-3',
    type: 'card',
    position: { x: 250, y: 350 },
    data: {
      label: 'Build Next.js Integration',
      description: 'Prepare nodes/edges JSON serialization logic for Django REST API.',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Antigravity AI',
    },
    width: 280,
    height: 180,
  },
];

const getDefaultWelcomeEdges = (): Edge[] => [
  {
    id: 'edge-welcome-1-2',
    source: 'welcome-1',
    target: 'welcome-3',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
];

// Replicates the user's SAP Business One Administracao tree layout
const getSapTemplateNodes = (): Node<NodeData>[] => [
  // Green background boundary frame
  {
    id: 'sap-group-admin',
    type: 'group',
    position: { x: 150, y: 100 },
    data: {
      label: 'Área de Administração',
      color: 'rgba(240, 253, 244, 0.7)', // emerald-50 translucent
      borderColor: '#22c55e', // emerald-500
      borderWidth: 2.5,
      borderStyle: 'solid',
      textColor: '#15803d', // emerald-700
      fontSize: 14,
      fontWeight: 'bold',
    },
    width: 1100,
    height: 720,
  },
  // Main Yellow Header Card
  {
    id: 'sap-card-header',
    type: 'shape',
    position: { x: 190, y: 170 },
    data: {
      label: 'ADMINISTRAÇÃO',
      shape: 'rounded-rectangle',
      color: '#fef08a', // amber-200
      borderColor: '#000000',
      borderWidth: 2.5,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 230,
    height: 75,
  },
  // Pink chain horizontal
  {
    id: 'sap-card-empresa',
    type: 'shape',
    position: { x: 460, y: 185 },
    data: {
      label: 'SELECIONAR / CRIAR\nEMPRESA 1',
      shape: 'rounded-rectangle',
      color: '#fda4af', // pink
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-webclient',
    type: 'shape',
    position: { x: 650, y: 185 },
    data: {
      label: 'WEB CLIENT',
      shape: 'rounded-rectangle',
      color: '#fda4af',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-taxas',
    type: 'shape',
    position: { x: 840, y: 185 },
    data: {
      label: 'TAXAS DE CÂMBIO E\nÍNDICES 2',
      shape: 'rounded-rectangle',
      color: '#fda4af',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-inicializacao',
    type: 'shape',
    position: { x: 1030, y: 185 },
    data: {
      label: 'INICIALIZAÇÃO DO\nSISTEMA',
      shape: 'rounded-rectangle',
      color: '#fda4af',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  // Vertical yellow chain
  {
    id: 'sap-card-detalhes',
    type: 'shape',
    position: { x: 1030, y: 280 },
    data: {
      label: 'DETALHES DA EMPRESA\n3',
      shape: 'rounded-rectangle',
      color: '#fef08a',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-config',
    type: 'shape',
    position: { x: 1030, y: 375 },
    data: {
      label: 'CONFIGURAÇÕES\nGERAIS 4',
      shape: 'rounded-rectangle',
      color: '#fef08a',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-periodos',
    type: 'shape',
    position: { x: 1030, y: 470 },
    data: {
      label: 'PERÍODOS CONTÁBEIS\n5',
      shape: 'rounded-rectangle',
      color: '#fef08a',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-autorizacoes',
    type: 'shape',
    position: { x: 1030, y: 565 },
    data: {
      label: 'AUTORIZAÇÕES',
      shape: 'rounded-rectangle',
      color: '#fda4af',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  // Left horizontal chain
  {
    id: 'sap-card-gerais',
    type: 'shape',
    position: { x: 840, y: 565 },
    data: {
      label: 'AUTORIZAÇÕES GERAIS\n6',
      shape: 'rounded-rectangle',
      color: '#fef08a',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-adicional',
    type: 'shape',
    position: { x: 650, y: 565 },
    data: {
      label: 'AUTORIZAÇÃO\nADICIONAL DO\nCRIADOR 7',
      shape: 'rounded-rectangle',
      color: '#fef08a',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 10,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-log',
    type: 'shape',
    position: { x: 460, y: 565 },
    data: {
      label: 'LOG DE MODIFICAÇÕES\nDE AUTORIZAÇÕES 8',
      shape: 'rounded-rectangle',
      color: '#fef08a',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  {
    id: 'sap-card-propriedade',
    type: 'shape',
    position: { x: 270, y: 565 },
    data: {
      label: 'PROPRIEDADE DE\nDADOS',
      shape: 'rounded-rectangle',
      color: '#fda4af',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  // Lower chain
  {
    id: 'sap-card-autprop',
    type: 'shape',
    position: { x: 270, y: 655 },
    data: {
      label: 'AUTORIZAÇÕES PARA\nPROPRIEDADE DE\nDADOS 9',
      shape: 'rounded-rectangle',
      color: '#fef08a',
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      textColor: '#000000',
      fontSize: 10,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    width: 150,
    height: 50,
  },
  // Sample screenshot overlays
  {
    id: 'sap-img-empresa',
    type: 'image',
    position: { x: 480, y: 260 },
    data: {
      label: 'Selecionar Empresa Window Screenshot',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
    },
    width: 110,
    height: 70,
  },
  {
    id: 'sap-img-taxas',
    type: 'image',
    position: { x: 860, y: 260 },
    data: {
      label: 'Rates Screen Screenshot',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
    },
    width: 110,
    height: 70,
  }
];

const getSapTemplateEdges = (): Edge[] => [
  { id: 'sap-e-h-empresa', source: 'sap-card-header', target: 'sap-card-empresa', animated: false, style: { stroke: '#000', strokeWidth: 2, strokeDasharray: '6 4' } },
  { id: 'sap-e-emp-web', source: 'sap-card-empresa', target: 'sap-card-webclient', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-web-taxas', source: 'sap-card-webclient', target: 'sap-card-taxas', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-tax-ini', source: 'sap-card-taxas', target: 'sap-card-inicializacao', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  
  { id: 'sap-e-ini-det', source: 'sap-card-inicializacao', target: 'sap-card-detalhes', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-det-cfg', source: 'sap-card-detalhes', target: 'sap-card-config', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-cfg-per', source: 'sap-card-config', target: 'sap-card-periodos', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-per-aut', source: 'sap-card-periodos', target: 'sap-card-autorizacoes', animated: false, style: { stroke: '#000', strokeWidth: 2 } },

  { id: 'sap-e-aut-ger', source: 'sap-card-autorizacoes', target: 'sap-card-gerais', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-ger-adi', source: 'sap-card-gerais', target: 'sap-card-adicional', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-adi-log', source: 'sap-card-adicional', target: 'sap-card-log', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'sap-e-log-pro', source: 'sap-card-log', target: 'sap-card-propriedade', animated: false, style: { stroke: '#000', strokeWidth: 2 } },

  { id: 'sap-e-pro-autp', source: 'sap-card-propriedade', target: 'sap-card-autprop', animated: false, style: { stroke: '#000', strokeWidth: 2 } },
  
  // Connect screenshots to cards
  { id: 'sap-e-emp-img', source: 'sap-card-empresa', target: 'sap-img-empresa', animated: false, style: { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' } },
  { id: 'sap-e-tax-img', source: 'sap-card-taxas', target: 'sap-img-taxas', animated: false, style: { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' } }
];

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  lockCanvas: false,
  gridType: 'dots',
  readOnly: false,
  past: [],
  future: [],
  
  // Gallery initial state
  diagrams: [],
  currentId: null,
  currentName: 'Default Diagram',

  takeSnapshot: () => {
    if (get().readOnly) return;
    const { nodes, edges, past } = get();
    const newPast = [...past, cloneState(nodes, edges)].slice(-50);
    set({
      past: newPast,
      future: [],
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
    });
    get().saveActiveDiagram();
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    if (get().readOnly) return;
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    get().saveActiveDiagram();
  },

  onConnect: (connection: Connection) => {
    if (get().readOnly) return;
    get().takeSnapshot();
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'custom',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          animated: false,
        },
        get().edges
      ),
    });
    get().saveActiveDiagram();
  },

  addNode: (type: string, position: { x: number; y: number }, customData?: Partial<NodeData>) => {
    if (get().readOnly) return;
    get().takeSnapshot();
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let defaultData: NodeData = { label: 'New Node' };
    let width = 150;
    let height = 60;

    if (type === 'shape') {
      defaultData = {
        label: 'Shape Node',
        shape: 'rectangle',
        color: '#ffffff',
        borderColor: '#94a3b8',
        borderWidth: 2,
        borderStyle: 'solid',
        textColor: '#0f172a',
        fontSize: 14,
        fontWeight: 'normal',
        textAlign: 'center',
      };
      width = 160;
      height = 60;
    } else if (type === 'sticky') {
      defaultData = {
        label: 'Write something...',
        stickyColor: 'yellow',
        textColor: '#78350f',
        fontSize: 14,
        fontFamily: 'handwritten',
      };
      width = 160;
      height = 160;
    } else if (type === 'card') {
      defaultData = {
        label: 'Task Title',
        description: 'Task description...',
        status: 'todo',
        priority: 'medium',
        assignee: '',
      };
      width = 280;
      height = 185;
    } else if (type === 'group') {
      defaultData = {
        label: 'Group Frame',
        color: 'rgba(241, 245, 249, 0.2)',
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
        borderWidth: 2,
        textColor: '#475569',
        fontSize: 14,
        fontWeight: 'semibold',
      };
      width = 400;
      height = 300;
    } else if (type === 'image') {
      defaultData = {
        label: 'Screenshot Image',
        imageUrl: '',
      };
      width = 160;
      height = 100;
    }

    const newNode: Node<NodeData> = {
      id,
      type,
      position,
      data: { ...defaultData, ...customData },
      width,
      height,
    };

    set({
      nodes: [...get().nodes, newNode],
    });
    get().saveActiveDiagram();
  },

  updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
    if (get().readOnly) return;
    get().takeSnapshot();
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
    });
    get().saveActiveDiagram();
  },

  updateNodeDimensions: (nodeId: string, width: number, height: number) => {
    if (get().readOnly) return;
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            width,
            height,
          };
        }
        return node;
      }),
    });
    get().saveActiveDiagram();
  },

  deleteSelected: () => {
    if (get().readOnly) return;
    get().takeSnapshot();
    const selectedNodes = get().nodes.filter((node) => node.selected);
    
    set({
      nodes: get().nodes.filter((node) => !node.selected),
      edges: get().edges.filter((edge) => !edge.selected && !selectedNodes.some(n => n.id === edge.source || n.id === edge.target)),
    });
    get().saveActiveDiagram();
  },

  clearCanvas: () => {
    if (get().readOnly) return;
    get().takeSnapshot();
    set({
      nodes: [],
      edges: [],
    });
    get().saveActiveDiagram();
  },

  setLockCanvas: (lock: boolean) => {
    if (get().readOnly) return;
    set({
      lockCanvas: lock,
      nodes: get().nodes.map((node) => ({
        ...node,
        draggable: !lock,
        selectable: !lock,
      })),
    });
  },

  setGridType: (type: 'dots' | 'lines' | 'off') => {
    set({ gridType: type });
  },

  setReadOnly: (read: boolean) => {
    set({
      readOnly: read,
      nodes: get().nodes.map((node) => ({
        ...node,
        draggable: !read,
        selectable: !read,
      })),
    });
  },

  undo: () => {
    if (get().readOnly) return;
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      future: [cloneState(nodes, edges), ...future],
      nodes: previous.nodes,
      edges: previous.edges,
    });
    get().saveActiveDiagram();
  },

  redo: () => {
    if (get().readOnly) return;
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, cloneState(nodes, edges)],
      future: newFuture,
      nodes: next.nodes,
      edges: next.edges,
    });
    get().saveActiveDiagram();
  },

  // ----------------------------------------------------
  // GALLERY persistence
  // ----------------------------------------------------
  loadGallery: () => {
    const raw = localStorage.getItem('virtuall-flow-gallery');
    let parsed: SavedDiagram[] = [];
    
    if (raw) {
      try {
        parsed = JSON.parse(raw) as SavedDiagram[];
      } catch (err) {
        console.error('Failed to parse gallery from localStorage', err);
      }
    }

    // Populate with default diagrams if empty
    if (parsed.length === 0) {
      const defaultDiagrams: SavedDiagram[] = [
        {
          id: 'welcome-demo',
          name: '🚀 Welcome Demo Board',
          updatedAt: new Date().toISOString(),
          nodes: getDefaultWelcomeNodes(),
          edges: getDefaultWelcomeEdges(),
        },
        {
          id: 'sap-demo',
          name: '📊 SAP Business One - Administração',
          updatedAt: new Date().toISOString(),
          nodes: getSapTemplateNodes(),
          edges: getSapTemplateEdges(),
        }
      ];
      localStorage.setItem('virtuall-flow-gallery', JSON.stringify(defaultDiagrams));
      parsed = defaultDiagrams;
    }

    set({ diagrams: parsed });
  },

  createNewDiagram: (name: string, templateType: 'welcome' | 'blank' | 'sap' = 'welcome') => {
    const newId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    let initialNodes = getDefaultWelcomeNodes();
    let initialEdges = getDefaultWelcomeEdges();

    if (templateType === 'blank') {
      initialNodes = [
        {
          id: 'start-1',
          type: 'shape',
          position: { x: 100, y: 100 },
          data: {
            label: 'Start here',
            shape: 'rounded-rectangle',
            color: '#ffffff',
            borderColor: '#8b5cf6',
            borderWidth: 2.5,
            borderStyle: 'solid',
            fontSize: 14,
            fontWeight: 'bold',
            textColor: '#1e1b4b',
          },
          width: 150,
          height: 55,
        }
      ];
      initialEdges = [];
    } else if (templateType === 'sap') {
      initialNodes = getSapTemplateNodes();
      initialEdges = getSapTemplateEdges();
    }

    const newDiagram: SavedDiagram = {
      id: newId,
      name: name || `New Flowchart ${get().diagrams.length + 1}`,
      updatedAt: new Date().toISOString(),
      nodes: initialNodes,
      edges: initialEdges,
    };

    const newDiagramsList = [newDiagram, ...get().diagrams];
    localStorage.setItem('virtuall-flow-gallery', JSON.stringify(newDiagramsList));
    
    set({
      diagrams: newDiagramsList,
      currentId: newId,
      currentName: newDiagram.name,
      nodes: newDiagram.nodes,
      edges: newDiagram.edges,
      past: [],
      future: [],
    });

    return newId;
  },

  loadDiagram: (id: string) => {
    get().loadGallery();
    const diagram = get().diagrams.find((d) => d.id === id);
    if (diagram) {
      set({
        currentId: id,
        currentName: diagram.name,
        nodes: cloneState(diagram.nodes, []).nodes,
        edges: cloneState([], diagram.edges).edges,
        past: [],
        future: [],
      });
      return true;
    }
    return false;
  },

  saveActiveDiagram: () => {
    const { currentId, nodes, edges, diagrams } = get();
    if (!currentId || get().readOnly) return;

    const updatedDiagrams = diagrams.map((d) => {
      if (d.id === currentId) {
        return {
          ...d,
          updatedAt: new Date().toISOString(),
          nodes: cloneState(nodes, []).nodes,
          edges: cloneState([], edges).edges,
        };
      }
      return d;
    });

    localStorage.setItem('virtuall-flow-gallery', JSON.stringify(updatedDiagrams));
    set({ diagrams: updatedDiagrams });
  },

  deleteDiagram: (id: string) => {
    const filtered = get().diagrams.filter((d) => d.id !== id);
    localStorage.setItem('virtuall-flow-gallery', JSON.stringify(filtered));
    
    set({
      diagrams: filtered,
      currentId: get().currentId === id ? null : get().currentId,
    });
  },

  renameDiagram: (id: string, name: string) => {
    const updated = get().diagrams.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          name,
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });

    localStorage.setItem('virtuall-flow-gallery', JSON.stringify(updated));
    set({
      diagrams: updated,
      currentName: get().currentId === id ? name : get().currentName,
    });
  },

  saveToLocalStorage: () => {
    const { nodes, edges } = get();
    localStorage.setItem('virtuall-flow-diagram', JSON.stringify({ nodes, edges }));
    get().saveActiveDiagram();
  },

  loadFromLocalStorage: () => {
    if (get().currentId) {
      get().loadDiagram(get().currentId!);
    } else {
      const data = localStorage.getItem('virtuall-flow-diagram');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.nodes && parsed.edges) {
            get().takeSnapshot();
            set({
              nodes: parsed.nodes,
              edges: parsed.edges,
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  },

  exportJson: () => {
    const { nodes, edges } = get();
    const exportObj = {
      nodes: nodes.map((n: Node<NodeData>) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        width: n.width,
        height: n.height,
      })),
      edges: edges.map((e: Edge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
        style: e.style,
        label: e.label,
      })),
    };
    return JSON.stringify(exportObj, null, 2);
  },

  importJson: (jsonString: string) => {
    if (get().readOnly) return false;
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        get().takeSnapshot();
        
        const sanitizedNodes = parsed.nodes.map((n: Partial<Node<NodeData>>) => ({
          id: n.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: n.type || 'shape',
          position: n.position || { x: 100, y: 100 },
          data: n.data || { label: 'Imported Node' },
          width: n.width,
          height: n.height,
          draggable: !get().lockCanvas,
          selectable: !get().lockCanvas,
        }));
        
        const sanitizedEdges = parsed.edges.map((e: Partial<Edge>) => ({
          id: e.id || `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: e.source || '',
          target: e.target || '',
          animated: !!e.animated,
          style: e.style || { stroke: '#94a3b8', strokeWidth: 2 },
          label: e.label,
        })).filter((e: Partial<Edge>) => e.source && e.target);

        set({
          nodes: sanitizedNodes,
          edges: sanitizedEdges,
        });
        get().saveActiveDiagram();
        return true;
      }
    } catch (err) {
      console.error('Failed to import JSON', err);
    }
    return false;
  },

  setNodesAndEdges: (nodes: Node<NodeData>[], edges: Edge[]) => {
    set({ nodes, edges });
    get().saveActiveDiagram();
  },
}));
