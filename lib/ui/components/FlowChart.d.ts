import { inferT } from '@bemedev/app-ts/lib/utils/typings';
import { Component } from 'solid-js';
import { edgeJSON, nodeJSON } from '../../services/main.types';
export type NodeProps = inferT<typeof nodeJSON>;
export type EdgeProps = inferT<typeof edgeJSON>;
interface Props {
    config?: {
        nodes?: Record<string, NodeProps>;
        edges?: Record<string, EdgeProps>;
    };
    onNodeAdded?: (node: NodeProps) => void;
    onNodeDeleted?: (nodeId: string) => void;
    onEdgeAdded?: (edge: EdgeProps) => void;
    onEdgeDeleted?: (edgeId: string) => void;
}
export declare const FlowChart: Component<Props>;
export {};
//# sourceMappingURL=FlowChart.d.ts.map