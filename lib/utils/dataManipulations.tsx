export const rankedClusters = (metadata) =>
  metadata.filter((d) => d.centroid.length > 0)

export const groupDatapointsByCluster = ({ dataset, clusters }) =>
  clusters
    .map((c) => {
      const out = { ...c, nodes: [] }
      //

      dataset.forEach((d) => {
        if (d.cluster_id === c.cluster_id) {
          out.nodes.push(d)
        }
      })

      // if (out.nodes.length === 0) {
      //   console.log(out)
      // }

      return out
    })
    .filter((c) => c.nodes.length > 0)
