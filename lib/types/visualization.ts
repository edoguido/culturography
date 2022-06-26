import { ClusterObjectProps } from "@/context/vizLayoutContext";

export interface DatasetProps {
  clusters: ClusterObjectProps[]
  allClusters: object[]
  extent: { x: number[]; y: number[] }
}

export type SourceNetworkNameType = 'source'
export type TargetNetworkNameType = 'target'
export type NetworkName = SourceNetworkNameType | TargetNetworkNameType
