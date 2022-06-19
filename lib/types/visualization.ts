import { ClusterObjectProps } from "@/context/vizLayoutContext";

export interface DatasetProps {
  clusters: ClusterObjectProps[]
  allClusters: object[]
  extent: { x: number[]; y: number[] }
}

export type SourceNetworkName = 'source'
export type TargetNetworkName = 'target'
export type NetworkName = SourceNetworkName | TargetNetworkName
