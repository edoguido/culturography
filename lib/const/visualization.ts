import { CoordinatesProps } from "@/context/vizLayoutContext"
import { SourceNetworkNameType, TargetNetworkNameType } from "@/types/visualization"
import { Color } from "@react-three/fiber"

// data
export const MIN_SIMILARITY_THRESHOLD: number = 0
// camera
export const SCENE_CENTER: CoordinatesProps = [0, 0]
export const INITIAL_ZOOM: number = 5
export const MAX_ZOOM: number = 60
export const ZOOMED_IN: number = 11
// appearance
export const BASE_POINT_SIZE: number = 1
export const BASE_LABEL_SCALE: number = 4
export const NO_OVERLAP_COLOR: Color = '#222222'
// motion
export const LERP_FACTOR: number = 0.065
export const SCALES_RANGE: [number, number] = [-60, 60]
// names
export const SOURCE_NETWORK_NAME: SourceNetworkNameType = 'source'
export const TARGET_NETWORK_NAME: TargetNetworkNameType = 'target'
