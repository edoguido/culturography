import { useEffect, useRef } from 'react'

import Graph from 'graphology'
// import gexf from 'graphology-gexf'
import Sigma from 'sigma'

import { useVizLayout } from '@/context/vizLayoutContext'

const SingleNetwork = ({ accessor }) => {
  const [layout] = useVizLayout()
  const ref = useRef()

  const clusterData = layout.clusters[accessor]
  const assetId = clusterData.shapefile.asset.assetId

  useEffect(() => {
    if (!ref.current) return

    const fetchAndRenderNetwork = async () => {
      const {
        shapefile: { asset },
      } = clusterData

      // const dataset = JSON.parse(layout.story.data.story_chapters[0].dataset)

      const rawData = await fetch(
        `https://apicdn.sanity.io/${asset.path}`
      ).then((res) => res.json())

      // const graph = gexf.parse(Graph, dataset)

      const dataset = {
        nodes: rawData.nodes.map((n) => ({
          ...n,
          key: n.id,
          attributes: {
            x: n.x,
            y: n.y,
          },
        })),
        edges: rawData.edges.map((e) => ({
          ...e,
          key: e.id,
        })),
      }

      const graph = new Graph()
      graph.import(dataset)

      const renderer = new Sigma(graph, ref.current)
      // renderer.refresh()
      // renderer.setSetting('labelRenderedSizeThreshold', 200)

      // const camera = renderer.getCamera()
    }

    fetchAndRenderNetwork()
  }, [ref, assetId])

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />
}

export default SingleNetwork
