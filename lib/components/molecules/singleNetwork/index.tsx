import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as PIXI from 'pixi.js'

import { useVizLayout } from '@/context/vizLayoutContext'

const pointSize = 3
const margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
}
const canvasResolution = 1

const SingleNetwork = ({ accessor }) => {
  const [layout] = useVizLayout()
  const clusterData = layout.clusters[accessor]
  const assetId = clusterData.shapefile.asset.assetId

  const [fetching, setFetching] = useState(true)

  const wrapperRef = useRef(null)
  const svgRef = useRef(null)

  // references to viz elements
  const dataset = useRef(null)
  const pixiApp = useRef(null)
  const pointsContainer = useRef(null)
  const pixiPoints = useRef([])

  // d3 properties
  const xScale = useRef(null)
  const yScale = useRef(null)
  const xScaleZoom = useRef(null)
  const yScaleZoom = useRef(null)
  const zoom = useRef(null)
  const scaleFactor = useRef(null)

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

    xScaleZoom.current = xScale.current.copy()
    yScaleZoom.current = yScale.current.copy()

    // zoom.current
    //   .translateExtent([
    //     [0, 0],
    //     [width, height],
    //   ])
    //   .extent([
    //     [margin.left, margin.top],
    //     [width - margin.right, height - margin.top],
    //   ])

    // svgRef.current.style.width = '100%'
    // svgRef.current.style.height = '100%'

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
    pixiPoints.current.forEach((pt, i) => {
      pt.position.set(
        xScaleZoom.current(dataset.current[i].x),
        yScaleZoom.current(dataset.current[i].y)
      )
      // pt.x = xScaleZoom.current(dataset.current[i].x)
      // pt.y = yScaleZoom.current(dataset.current[i].y)
      return pt
    })
  }

  function initZoom() {
    const { width, height } = wrapperRef.current.getBoundingClientRect()

    zoom.current = d3
      .zoom()
      .scaleExtent([1, 20])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.top],
      ])
      .on('zoom', zoomed)

    d3.select(svgRef.current).call(zoom.current)

    // remember to only filter if we're in story mode
    function filterEvent(event) {
      return (
        event.type !== 'mousedown' &&
        event.type !== 'wheel' &&
        event.type !== 'touchstart'
      )
    }

    zoom.current.filter(filterEvent)
  }

  // called in every tick transition
  function zoomed(event, d) {
    scaleFactor.current = event.transform.k

    const { width, height } = wrapperRef.current.getBoundingClientRect()

    xScaleZoom.current.range(
      [margin.left, width - margin.right].map((d) => event.transform.applyX(d))
    )
    yScaleZoom.current.range(
      [margin.top, height - margin.bottom].map((d) => event.transform.applyY(d))
    )

    drawPoints()
  }

  function zoomTo(x, y, z = 1) {
    const { width, height } = wrapperRef.current.getBoundingClientRect()

    d3.select(svgRef.current)
      .transition()
      .duration(1500)
      .call(
        zoom.current.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(z)
          .translate(-x, -y)
      )
  }

  function resetZoom() {
    const { width, height } = wrapperRef.current.getBoundingClientRect()

    d3.select(svgRef.current)
      .transition()
      .duration(1000)
      .call(
        zoom.current.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1)
          .translate(-width / 2, -height / 2)
      )
  }

  useEffect(() => {
    if (!wrapperRef.current) return

    const fetchNetwork = async () => {
      const {
        shapefile: { asset },
      } = clusterData

      // const dataset = JSON.parse(layout.story.data.story_chapters[0].dataset)

      const rawData = await fetch(`/api/${asset.assetId}`).then((res) =>
        res.json()
      )

      setFetching(false)

      // we only need nodes for now
      return rawData.nodes
    }

    const initializeRenderContext = (data) => {
      dataset.current = data

      // initiate app
      pixiApp.current = new PIXI.Application({
        antialias: true,
        backgroundAlpha: 0,
        resolution: canvasResolution,
      })

      // we make canvas match parent size
      resizeRenderer()

      const { width, height } = wrapperRef.current.getBoundingClientRect()

      // initiate particles container
      pointsContainer.current = new PIXI.ParticleContainer(dataset.current, {
        scale: true,
        position: true,
        rotation: true,
        uvs: false,
        alpha: true,
      })

      const circle = new PIXI.Graphics()
      circle.lineStyle(1, 0x000000)
      circle.beginFill(0xffffff, 0.5)
      circle.drawCircle(0, 0, pointSize)
      circle.endFill()

      const pointTexture = pixiApp.current.renderer.generateTexture(circle)
      pointTexture.mipmap = true

      pixiPoints.current = dataset.current.map((d, id) => {
        const pt = PIXI.Sprite.from(pointTexture)
        pt.anchor.x = 0.5
        pt.anchor.y = 0.5
        pt.alpha = 1
        pt.tint = xScale.current(d.x) > width / 2 ? 0xff0000 : 0x00ff00
        pt.x = xScale.current(d.x)
        pt.y = yScale.current(d.y)
        // pt.selected = false
        // pt.orig_idx = id
        return pt
      })

      cleanStage()
      initZoom()

      wrapperRef.current.appendChild(pixiApp.current.view)
    }

    fetchNetwork().then(initializeRenderContext)

    // reset viz when asset changes
    return () => pixiApp.current.destroy(true, true)
  }, [wrapperRef, assetId])

  // update zoom
  useEffect(() => {
    if (!wrapperRef.current || !zoom.current) return

    zoomTo(Math.random() * 400, Math.random() * 400)
  }, [wrapperRef, zoom, layout.story.block])

  // update canvas on resize
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
      {fetching && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100000,
            backgroundColor: 'white',

            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Fetching!
        </div>
      )}
      <svg
        ref={svgRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: '1000',
          display: 'block',
        }}
      />
      <div ref={wrapperRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}

export default SingleNetwork
