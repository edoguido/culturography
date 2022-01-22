import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import * as d3 from 'd3'
import * as d3annotation from 'd3-svg-annotation'

import { useVizLayout } from '@/context/vizLayoutContext'
// import { apiFetch } from 'utils/cms'

const MAX_NODES = 100000
const MIN_SIMILARITY_THRESHOLD = 0.1
const INITIAL_POINT_ALPHA = 0.5

const canvasResolution = 1
const pointSize = 1

const margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
}

const SingleNetwork = ({ accessor }) => {
  const [layout] = useVizLayout()
  const [fetching, setFetching] = useState(true)

  const clusterData = layout.clusters[accessor]
  const assetId = clusterData.shapefile.asset.assetId

  const isSourceNetwork = accessor === 'left'
  const chapters = layout.story.data.story_chapters
  const currentChapter = chapters[layout.story.chapter]
  const networkKeyName = `${accessor}_network_name`
  const network = currentChapter.networks[networkKeyName]
  const currentNetworkClusters = layout.clusters.metadata.find(
    ({ name }) => name === network
  )

  // highlighted cluster information
  const highlightedClusterIndex = layout.clusters.highlight

  const highlightedCluster = useMemo(() => {
    if (!highlightedClusterIndex) return [null, { similarities: null }]
    if (highlightedClusterIndex === 'all') return [null, { similarities: null }]
    return Object.entries(
      layout.clusters.metadata.find(({ name }) => name !== network).cluster_info
    )[highlightedClusterIndex - 1]
  }, [highlightedClusterIndex])

  const highlightedClusterId: any = highlightedCluster[0]
  const highlightedClusterData: any = highlightedCluster[1]
  const highlightedClusterSimilarities: object =
    highlightedClusterData.similarities

  // // means we're focusing on one cluster
  const isHighlightingCluster = typeof highlightedClusterId === 'string'

  const allClusters = useMemo(
    () =>
      Array.from(
        new Set(
          layout.clusters.metadata
            ?.map(({ cluster_info }) => {
              return Object.keys(cluster_info)
            })
            .flat()
        )
      ),
    [layout.clusters?.metadata]
  )

  const colorScale = d3
    .scaleSequentialQuantile(d3.interpolateSinebow)
    .domain(allClusters)

  const alphaScale = d3
    .scaleLog()
    .domain([MIN_SIMILARITY_THRESHOLD, 1])
    .range([0, 1])

  //
  // refs
  const wrapperRef = useRef(null)
  const svgRef = useRef(null)

  // references to viz elements
  const dataset = useRef(null)
  const clusters = useRef(null)
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
  const annotationsMaker = useRef(null)

  // const _annotations = [
  //   {
  //     note: { label: 'Hi' },
  //     x: 10,
  //     y: 10,
  //     dy: 137,
  //     dx: 162,
  //     subject: { radius: 50, radiusPadding: 10 },
  //   },
  // ]

  //utils

  const formatColor = useCallback(
    (rgbString) =>
      Number(d3.color(colorScale(rgbString)).formatHex().replace('#', '0x')),
    []
  )

  const pointColor = (clusterNumber) => {
    switch (highlightedClusterIndex) {
      case null:
        return 0xffffff
      case 'all':
        const belongsToObservedCluster = allClusters.findIndex(
          (n) => n == clusterNumber
        )
        if (!belongsToObservedCluster) return 0xffffff

        return formatColor(clusterNumber)
      default:
        if (isSourceNetwork) {
          if (clusterNumber != highlightedClusterId) return 0x333333

          return formatColor(highlightedClusterId)
        }
        const output = highlightedClusterSimilarities[clusterNumber]
        if (!output || output < MIN_SIMILARITY_THRESHOLD) return 0x333333

        return formatColor(highlightedClusterId)
    }
  }

  const pointAlpha = (clusterNumber) => {
    switch (highlightedClusterIndex) {
      case null:
        return INITIAL_POINT_ALPHA
      case 'all':
        return INITIAL_POINT_ALPHA
      default:
        // point belongs to selected cluster
        if (clusterNumber == highlightedClusterId) return INITIAL_POINT_ALPHA
        // point is from source network but does not belong to selected cluster
        if (isSourceNetwork && clusterNumber != highlightedClusterId)
          return 0.01

        const output = highlightedClusterSimilarities[clusterNumber]

        // point has no similarity with selected cluster
        if (!output) return 1
        // point has too low similarity with selected cluster
        if (output < MIN_SIMILARITY_THRESHOLD) return 1

        return alphaScale(output)
    }
  }

  const updatePointsColor = async () => {
    pixiPoints.current.forEach((pt) => {
      pt.tint = pointColor(pt.cluster)
      pt.alpha = pointAlpha(pt.cluster)
    })
  }

  const updatePointsPosition = () => {
    if (!pixiPoints.current) return

    pixiPoints.current.forEach((pt, i) => {
      pt.position.set(
        xScaleZoom.current(dataset.current[i].x),
        yScaleZoom.current(dataset.current[i].y)
      )
      return pt
    })
  }

  //
  // **
  // runtime

  const fetchNetwork = async () => {
    const {
      shapefile: { asset },
    } = clusterData

    // const dataset = JSON.parse(layout.story.data.story_chapters[0].dataset)

    const data = await fetch(`https://api.sanity.io/${asset.path}`, {
      headers: {
        accepts: 'application/json',
      },
    })
      .then((r) => r.json())
      .catch(console.error)

    dataset.current = data.nodes?.slice(0, MAX_NODES) || []
    clusters.current = data.meta?.clusters

    setFetching(false)
  }

  const initializeRenderContext = () => {
    // initiate app
    pixiApp.current = new PIXI.Application({
      antialias: false,
      backgroundAlpha: 1,
      backgroundColor: 0x000000,
      resolution: canvasResolution,
    })

    // we make canvas match parent size
    resizeRenderer()

    makeSprites()
    cleanStage()
    initZoom()

    wrapperRef.current.appendChild(pixiApp.current.view)
  }

  const getCanvasDimensions = () => {
    const { width: _w, height: _h } = wrapperRef.current.getBoundingClientRect()

    const w = _w / canvasResolution
    const h = _h / canvasResolution

    return { width: w, height: h }
  }

  const resizeRenderer = () => {
    const { width: w, height: h } = getCanvasDimensions()

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
    circle.cacheAsBitmap = true
    // circle.lineStyle(1, 0x000000)
    circle.beginFill(0xffffff, 1)
    circle.drawCircle(0, 0, pointSize)
    circle.endFill()

    const pointTexture = pixiApp.current.renderer.generateTexture(circle)
    pointTexture.mipmap = true

    pixiPoints.current = dataset.current.map((d) => {
      const pt = PIXI.Sprite.from(pointTexture)
      pt.anchor.x = 0.5
      pt.anchor.y = 0.5
      pt.alpha = 0.5
      // @ts-ignore
      pt.cluster = d.cluster
      // pt.orig_idx = id
      return pt
    })

    updatePointsColor()
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

  //
  // zoom

  const initZoom = () => {
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

    // remember to only filter interactions if we're in story mode
    function filterZoomEvent(event) {
      return event

      if (!layout.read) return event

      return (
        event.type !== 'mousedown' &&
        event.type !== 'wheel' &&
        event.type !== 'dblclick' &&
        event.type !== 'touchstart'
      )
    }

    zoom.current.filter(filterZoomEvent)
  }

  const updateZoomScales = () => {
    xScaleZoom.current = xScale.current.copy()
    yScaleZoom.current = yScale.current.copy()
  }

  const zoomTo = (x: number, y: number, z: number) => {
    const { width: w, height: h } = getCanvasDimensions()

    const middleX = w / 2
    const middleY = h / 2

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

  const resetZoom = () => {
    zoomTo(null, null, 1)
  }

  // called in every tick transition
  const zoomed = (event) => {
    scaleFactor.current = event.transform || scaleFactor.current
    // const k = scaleFactor.current.k

    const { width: w, height: h } = getCanvasDimensions()

    xScaleZoom.current.range(
      [margin.left, w - margin.right].map((d) => scaleFactor.current.applyX(d))
    )
    yScaleZoom.current.range(
      [margin.top, h - margin.bottom].map((d) => scaleFactor.current.applyY(d))
    )

    updatePointsPosition()
    repositionAnnotations()
  }

  const updateZoom = () => {
    if (isHighlightingCluster) {
      const targetCluster = clusters.current.find(
        (c) => c.clusterId == highlightedClusterId
      )

      if (!targetCluster) return

      const { shape } = targetCluster

      updateZoomScales()

      const targetX = -xScaleZoom.current(shape[0])
      const targetY = -yScaleZoom.current(shape[1])

      zoomTo(targetX, targetY, 1)
      return
    }

    resetZoom()
  }

  // // this is for test purposes
  // const focusOnRandomPoint = () => {
  //   const rid = Math.floor(Math.random() * dataset.current.length)
  //   const point = dataset.current[rid]

  //   // highlightSinglePoint(rid)

  //   // we first have to update the zoom scales
  //   updateZoomScales()

  //   // then we assign the refreshed values
  //   const { x, y } = point
  //   const pointX = -xScaleZoom.current(x)
  //   const pointY = -yScaleZoom.current(y)
  //   const randomZoom = Math.ceil(Math.random() * 6)

  //   zoomTo(pointX, pointY, randomZoom)
  // }

  const clusterAnnotations = (clusters) =>
    clusters
      .filter(({ clusterId }) => {
        if (!highlightedClusterSimilarities) return false
        if (isSourceNetwork && clusterId != highlightedClusterId) return false
        const similarity = highlightedClusterSimilarities[clusterId]
        if (
          !isSourceNetwork &&
          (!similarity || similarity < MIN_SIMILARITY_THRESHOLD)
        )
          return false

        return true
      })
      .map((d) => {
        const { clusterId, name, shape } = d

        const clusterProps = currentNetworkClusters.cluster_info[clusterId]

        d.x = xScaleZoom.current(shape[0])
        d.y = yScaleZoom.current(shape[1])
        d.dx = 40
        d.dy = 40

        return {
          note: {
            title: clusterProps?.name || '',
            bgPadding: 20,
            label: 'Longer text to show text wrapping',
          },
          color: 'white',
          x: d.x,
          y: d.y,
          dx: d.dx,
          dy: d.dy,
          type: d3annotation.annotationCalloutCircle,
          subject: { radius: 10, radiusPadding: 10 },
          data: {
            x0: d.x,
            y0: d.y,
            dx0: d.dx,
            dy0: d.dy,
          },
        }
      })

  const showAnnotations = () => {
    const annotations = clusterAnnotations(clusters.current)

    annotationsMaker.current = d3annotation
      .annotation()
      .annotations(annotations)

    d3.select(svgRef.current)
      .append('g')
      .attr('class', `annotation-group-${accessor}`)
      .call(annotationsMaker.current)
  }

  const refreshAnnotations = () => {
    clearAnnotations()
    if (isHighlightingCluster) showAnnotations()
  }

  const repositionAnnotations = () => {
    annotationsMaker.current.annotations().forEach((d) => {
      d.x = xScaleZoom.current(d.data.x0)
      d.y = yScaleZoom.current(d.data.y0)
      d.dx = d.data.dx0
      d.dy = d.data.dy0
    })
    annotationsMaker.current.update()
  }

  const clearAnnotations = () => {
    d3.select(`.annotation-group-${accessor}`).remove()
  }

  // initiate app
  useEffect(() => {
    if (!wrapperRef.current) return

    fetchNetwork().then(() => {
      initializeRenderContext()
      // focusOnRandomPoint()
      showAnnotations()
    })

    // reset viz when asset changes
    return () => {
      pixiPoints.current = null
      pixiApp.current?.destroy(true, true)
      pixiApp.current = null
      clearAnnotations()
    }
  }, [wrapperRef, assetId, layout.story.chapter])

  // initiate zoom
  useEffect(() => {
    initZoom()
  }, [layout.read])

  // update canvas on resize
  useEffect(() => {
    if (!wrapperRef.current) return

    function handleResize(event) {
      zoomed(event)
      resizeRenderer()
      updatePointsPosition()
      repositionAnnotations()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [wrapperRef])

  // update zoom
  useEffect(() => {
    if (!pixiPoints.current) return
    updatePointsColor()
    // focusOnRandomPoint()
    updateZoom()
    refreshAnnotations()
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
            color: 'white',
            backgroundColor: 'black',
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
