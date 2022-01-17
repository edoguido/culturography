import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as PIXI from 'pixi.js'

import { useVizLayout } from '@/context/vizLayoutContext'
import { apiFetch } from 'utils/cms'

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
  const pixiPoints = useRef(null)

  // d3 properties
  const xScale = useRef(null)
  const yScale = useRef(null)
  const xScaleZoom = useRef(null)
  const yScaleZoom = useRef(null)
  const zoom = useRef(null)
  const scaleFactor = useRef(null)

  const fetchNetwork = async () => {
    const {
      shapefile: { asset },
    } = clusterData

    // const dataset = JSON.parse(layout.story.data.story_chapters[0].dataset)

    const data = await apiFetch(asset.assetId)

    setFetching(false)

    const threshold = 100000

    // we only need nodes for now
    dataset.current = data.nodes.slice(1, threshold)
  }

  const initializeRenderContext = () => {
    // initiate app
    pixiApp.current = new PIXI.Application({
      antialias: true,
      backgroundAlpha: 0,
      resolution: canvasResolution,
    })

    // we make canvas match parent size
    resizeRenderer()

    makeSprites()
    cleanStage()
    initZoom()

    wrapperRef.current.appendChild(pixiApp.current.view)
  }

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

    updateZoomScales()
    resetZoom()

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

  const makeSprites = () => {
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
      pt.alpha = 0.5
      pt.tint = pointColor(xScale.current(d.x) > xScale.current.range()[1] / 2)
      pt.x = xScale.current(d.x)
      pt.y = yScale.current(d.y)
      // pt.selected = false
      // pt.orig_idx = id
      return pt
    })
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

  const pointColor = (condition) => {
    return 0x666666
    // return condition ? 0xff0000 : 0x00ff00
  }

  function drawPoints() {
    if (!pixiPoints.current) return

    pixiPoints.current.forEach((pt, i) => {
      pt.position.set(
        xScaleZoom.current(dataset.current[i].x),
        yScaleZoom.current(dataset.current[i].y)
      )
      return pt
    })
  }

  const highlightSinglePoint = (idx) => {
    pixiPoints.current.forEach((point, i) => {
      point.tint = pointColor(
        dataset.current[i].x > xScale.current.range()[1] / 2
      )
      // point.alpha = 0.05
      point.scale.x = 1
      point.scale.y = 1
    })
    const currentPoint = pixiPoints.current[idx]
    currentPoint.tint = 0x0000ff
    // currentPoint.alpha = 1
    currentPoint.scale.x = 3
    currentPoint.scale.y = 3
  }

  function initZoom() {
    zoom.current = d3
      .zoom()
      .scaleExtent([1, 10])
      // .translateExtent([
      //   [0, 0],
      //   [width, height],
      // ])
      // .extent([
      //   [margin.left, margin.top],
      //   [width - margin.right, height - margin.top],
      // ])
      .on('zoom', zoomed)

    d3.select(svgRef.current).call(zoom.current)

    // remember to only filter if we're in story mode
    function filterEvent(event) {
      if (!layout.read) return event

      return (
        event.type !== 'mousedown' &&
        event.type !== 'wheel' &&
        event.type !== 'touchstart'
      )
    }

    zoom.current.filter(filterEvent)
  }

  const updateZoomScales = () => {
    xScaleZoom.current = xScale.current.copy()
    yScaleZoom.current = yScale.current.copy()
  }

  function zoomTo(x: number, y: number, z: number) {
    const { width, height } = wrapperRef.current.getBoundingClientRect()

    const middleX = width / 2
    const middleY = height / 2

    if (!x) x = -middleX
    if (!y) y = -middleY

    d3.select(svgRef.current)
      .transition()
      .ease(d3.easeExpOut)
      .duration(1000)
      .call(
        zoom.current.transform,
        d3.zoomIdentity.translate(middleX, middleY).scale(z).translate(x, y)
      )
  }

  function resetZoom() {
    zoomTo(null, null, 1)
  }

  // called in every tick transition
  function zoomed(event) {
    scaleFactor.current = event.transform || scaleFactor.current
    // const k = scaleFactor.current.k

    const { width, height } = wrapperRef.current.getBoundingClientRect()

    xScaleZoom.current.range(
      [margin.left, width - margin.right].map((d) =>
        scaleFactor.current.applyX(d)
      )
    )
    yScaleZoom.current.range(
      [margin.top, height - margin.bottom].map((d) =>
        scaleFactor.current.applyY(d)
      )
    )

    drawPoints()
  }

  // this is for test purposes
  const focusOnRandomPoint = () => {
    const rid = Math.floor(Math.random() * dataset.current.length)
    const point = dataset.current[rid]

    highlightSinglePoint(rid)

    // we first have to update the zoom scales
    updateZoomScales()

    // then we assign the refreshed values
    const { x, y } = point
    const pointX = -xScaleZoom.current(x)
    const pointY = -yScaleZoom.current(y)
    const randomZoom = Math.ceil(Math.random() * 6)

    zoomTo(pointX, pointY, randomZoom)
  }

  useEffect(() => {
    // if (!wrapperRef.current) return

    fetchNetwork().then(() => {
      initializeRenderContext()
      // focusOnRandomPoint()
    })

    // reset viz when asset changes
    return () => {
      pixiPoints.current = null
      pixiApp.current?.destroy(true, true)
      pixiApp.current = null
    }
  }, [wrapperRef, assetId, layout.story.chapter])

  // update canvas on resize
  useEffect(() => {
    if (!wrapperRef.current) return

    function handleResize() {
      resizeRenderer()
      drawPoints()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [wrapperRef])

  // update zoom
  useEffect(() => {
    if (!pixiPoints.current) return
    focusOnRandomPoint()
  }, [wrapperRef, pixiPoints, layout.story.block])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
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
