import { ClusterObjectProps, CoordinatesProps } from "@/context/vizLayoutContext"
import { MIN_SIMILARITY_THRESHOLD } from "@/const/visualization"
import { polygonCentroid } from "./math"

export const rankedClusters = (allClustersArray: ClusterObjectProps[]): ClusterObjectProps[] =>
  allClustersArray.filter((d) => d.pca_centroid.length > 0)

export const groupDatapointsByCluster = ({ dataset, clusters }) =>
  clusters
    .map((c) => {
      const out = { ...c, nodes: [] }

      dataset.forEach((d) => {
        if (d.cluster_id === c.cluster_id) {
          out.nodes.push(d)
        }
      })

      return out
    })
    .filter((c) => c.nodes.length > 0)

export const matchingClusters = (activeCluster: ClusterObjectProps, allClusters: ClusterObjectProps[]): ClusterObjectProps[] => allClusters.filter(
  ({ cluster_id }: ClusterObjectProps) => {
    const similarity = activeCluster.similarities[cluster_id]
    return similarity > MIN_SIMILARITY_THRESHOLD
  }
)


export const allMatchingClustersCetroids = (activeCluster: ClusterObjectProps, allClusters: ClusterObjectProps[]): CoordinatesProps[] => {
  const match = matchingClusters(activeCluster, allClusters)

  return match.map(
    (c: ClusterObjectProps) => c.pca_centroid
  )
}


// we compute the centroid among all the matching polygons
export const matchingClustersMiddlePoint = (matchingClustersCentroids: CoordinatesProps[], { xScale, yScale }: { xScale: (x) => number, yScale: (y) => number }): CoordinatesProps => {
  const [x, y] = polygonCentroid(matchingClustersCentroids)
  return [xScale(x), -yScale(y)]
}
