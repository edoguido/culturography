import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as PIXI from 'pixi.js'

import { useVizLayout } from '@/context/vizLayoutContext'

const pointSize = 6
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
}
const canvasResolution = 0.5

const SingleNetwork = ({ accessor }) => {
  const [layout] = useVizLayout()

  const wrapperRef = useRef(null)
  const dataset = useRef(null)
  // references to viz elements
  const pixiApp = useRef(null)
  const pointsContainer = useRef(null)
  const pixiPoints = useRef([])

  const xScale = useRef(null)
  const yScale = useRef(null)

  const clusterData = layout.clusters[accessor]
  const assetId = clusterData.shapefile.asset.assetId

  const resizeRenderer = () => {
    // match
    const { width, height } = wrapperRef.current.getBoundingClientRect()

    const w = width / canvasResolution
    const h = height / canvasResolution

    xScale.current = d3
      .scaleLinear()
      .range([margin.left, w - margin.right])
      .domain(d3.extent(dataset.current, (d) => d.x))
    yScale.current = d3
      .scaleLinear()
      .range([margin.top, h - margin.bottom])
      .domain([
        d3.max(dataset.current, (d) => d.y),
        d3.min(dataset.current, (d) => d.y),
      ])

    pixiApp.current.renderer.resize(w, h)
  }

  const cleanStage = () => {
    // clean stage
    while (pixiApp.current.stage.children[0]) {
      pixiApp.current.stage.removeChild(pixiApp.current.stage.children[0])
    }
    pixiApp.current.stage.addChild(pointsContainer.current)

    while (pointsContainer.current.children[0]) {
      pointsContainer.current.removeChild(pointsContainer.current.children[0])
    }
    pixiPoints.current.forEach((p) => pointsContainer.current.addChild(p))
  }

  function drawPoints() {
    if (!pixiPoints.current) throw new Error('No pixi points currently')

    pixiPoints.current.forEach((pt, i) => {
      pt.x = xScale.current(dataset.current[i].x)
      pt.y = yScale.current(dataset.current[i].y)
      return pt
    })
  }

  useEffect(() => {
    if (!wrapperRef.current) return

    const fetchNetwork = async () => {
      const {
        shapefile: { asset },
      } = clusterData

      // const dataset = JSON.parse(layout.story.data.story_chapters[0].dataset)

      const rawData = await fetch(
        `https://apicdn.sanity.io/${asset.path}`
      ).then((res) => res.json())

      // const graph = gexf.parse(Graph, dataset)

      // const network = {
      //   nodes: rawData.nodes.map((n) => ({
      //     ...n,
      //     key: n.id,
      //     attributes: {
      //       x: n.x,
      //       y: n.y,
      //     },
      //   })),
      //   edges: rawData.edges.map((e) => ({
      //     ...e,
      //     key: e.id,
      //   })),
      // }

      // we only need nodes for now
      return rawData.nodes
    }

    const initializeRenderContext = (data) => {
      dataset.current = data

      // initiate app
      pixiApp.current = new PIXI.Application({
        // antialias: true,
        backgroundAlpha: 0,
        resolution: canvasResolution,
      })

      // we make canvas match parent size
      resizeRenderer()

      // initiate particles
      pointsContainer.current = new PIXI.ParticleContainer(dataset.current, {
        scale: true,
        position: true,
        rotation: true,
        uvs: false,
        alpha: true,
      })

      const circle = new PIXI.Graphics()
      // circle.lineStyle(3, 0x000000)
      circle.beginFill(0x000000, 1)
      circle.drawCircle(0, 0, pointSize)
      circle.endFill()

      const pointTexture = pixiApp.current.renderer.generateTexture(circle)
      pointTexture.mipmap = true

      pixiPoints.current = dataset.current.map((d, id) => {
        const pt = PIXI.Sprite.from(pointTexture)
        pt.anchor.x = 0.5
        pt.anchor.y = 0.5
        pt.alpha = 0.5
        pt.x = xScale.current(d.x)
        pt.y = yScale.current(d.y)
        // pt.selected = false
        // pt.orig_idx = id
        return pt
      })

      cleanStage()

      wrapperRef.current.appendChild(pixiApp.current.view)
    }

    fetchNetwork().then(initializeRenderContext)

    // reset viz when asset changes
    return () => pixiApp.current.destroy(true, true)
  }, [wrapperRef, assetId])

  useEffect(() => {
    function handleResize() {
      resizeRenderer()
      drawPoints()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        border: '1px solid red',
      }}
    >
      <div ref={wrapperRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}

export default SingleNetwork
