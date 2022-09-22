import * as d3 from 'd3'
import * as chroma from 'chroma-js'
import { LEGEND_NUM_STEPS } from '@/const/legend'
import { ClusterObjectProps } from '@/context/vizLayoutContext'
import { MIN_SIMILARITY_THRESHOLD, NO_OVERLAP_COLOR } from '@/const/visualization'

const OVERLAP_DOMAIN = [0, 1]   // minimum and maximum value for clusters the overlap

// make a color scale with all the IDs of the clusters
export const makeHueScale = (clustersid, id) =>
  d3
    .scaleQuantize()
    .domain(d3.extent(clustersid))
    .range(d3.quantize(d3.interpolateSinebow, clustersid.length))(id)

export const makeQuantizedColorScale = (targetColor) => d3.quantize(
  d3.scaleLinear().domain(OVERLAP_DOMAIN).range(['#666666', targetColor]),
  LEGEND_NUM_STEPS
)

export const similarityColorScale = (arrayOfClusterIDs, activeClusterID, similarity, maxOverlap) => {
  const clusterColor = makeHueScale(arrayOfClusterIDs, activeClusterID)
  const colorRangeQuantized = makeQuantizedColorScale(clusterColor)

  // console.group()
  // console.log("%c Cluster Color ", `background-color:${clusterColor}; color: white`)
  // colorRangeQuantized.forEach(c => {
  //   console.log("%c color ", `background-color:${c}; color: white`)
  // })
  // console.groupEnd()

  return d3.scaleQuantize().domain([0, maxOverlap]).range(colorRangeQuantized)(similarity)
}

interface getColorProps { id: number, activeCluster: ClusterObjectProps, allClustersID: number[], maxOverlap?: number }

export const getColor = ({ id, activeCluster, allClustersID, maxOverlap = 1 }: getColorProps
) => {


  // we're not highlighting any cluster at the moment
  if (!activeCluster) return makeHueScale(allClustersID, id)

  // otherwise we're highlighting a cluster
  // --
  // if we're in the source network...
  if (id === activeCluster.cluster_id) {
    return makeHueScale(allClustersID, id)
  }

  // but if we're not in the source network, we must find
  // source network similarities in target network
  const similarityWithHighlightedCluster = activeCluster.similarities[id]


  if (
    similarityWithHighlightedCluster &&
    similarityWithHighlightedCluster > MIN_SIMILARITY_THRESHOLD
  ) {
    // const similarityScaleValue = similarityScale(
    //   similarityWithHighlightedCluster
    // )
    const similarityScaleValue = similarityColorScale(allClustersID, activeCluster.cluster_id, similarityWithHighlightedCluster, maxOverlap)

    return similarityScaleValue
  }

  return NO_OVERLAP_COLOR
}

export function getTextColor(color) {
  return chroma(color).luminance() > 0.28 ? 'text-text' : 'text-white'
}
