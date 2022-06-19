import { Ref, useCallback, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import * as d3 from 'd3'
import { useControls } from 'leva'
//
import { ClusterObjectProps, useVizLayout } from '@/context/vizLayoutContext'
import { LEGEND_NUM_STEPS } from '@/const/legend'
import { useFrame } from '@react-three/fiber'
import { lerp, polygonCentroid, round } from 'utils/math'
import { OrthographicCamera } from '@react-three/drei'

import {
  INITIAL_ZOOM,
  LERP_FACTOR,
  MAX_ZOOM,
  MIN_SIMILARITY_THRESHOLD,
  NO_OVERLAP_COLOR,
  SCALES_RANGE,
  SCENE_CENTER,
  ZOOMED_IN,
} from '@/const/visualization'
import { DatasetProps } from '@/types/visualization'

const Cluster = dynamic(
  () => import('components/visualization/atoms/cluster'),
  { ssr: false }
)

interface SceneProps {
  dataset: DatasetProps
  networkName: string
  activeCluster: ClusterObjectProps
  isSourceNetwork: boolean
  zoomLevel: string
  forwardRef?: Ref<HTMLCanvasElement>
}

const Scene = ({
  dataset,
  networkName,
  activeCluster,
  isSourceNetwork,
  zoomLevel,
}: SceneProps) => {
  const [layout, dispatch] = useVizLayout()

  const [{ cameraPosition, cameraZoom }, set] = useControls(
    networkName,
    () => ({
      cameraPosition: {
        value: [0, 0],
        step: 1,
      },
      cameraZoom: { value: INITIAL_ZOOM, min: INITIAL_ZOOM, max: MAX_ZOOM },
    })
  )

  const cameraRef = useRef(null)
  const groupRef = useRef(null)

  // scales
  const xScale = useMemo(
    () => d3.scaleLinear().domain(dataset.extent.x).range(SCALES_RANGE),
    [networkName]
  )
  const yScale = useMemo(
    () => d3.scaleLinear().domain(dataset.extent.y).range(SCALES_RANGE),
    [networkName]
  )

  const activeClusterId = activeCluster?.cluster_id || 0
  const allClustersID = dataset.allClusters.map(
    (d: ClusterObjectProps) => d.cluster_id
  )

  const hueScale = useMemo(
    () =>
      d3
        .scaleQuantize()
        .domain(d3.extent(allClustersID))
        .range(d3.quantize(d3.interpolateSinebow, allClustersID.length)),
    [allClustersID]
  )

  const intensityColorScaleQuantized = useMemo(
    () => (targetColor) =>
      d3.quantize(
        d3.scaleLinear().range(['#666666', targetColor]),
        LEGEND_NUM_STEPS
      ),
    []
  )

  const highlightColor = activeCluster
    ? hueScale(activeCluster.cluster_id)
    : undefined

  const quantizedColorRange = activeCluster
    ? intensityColorScaleQuantized(highlightColor)
    : undefined

  const similarityScale = activeCluster
    ? d3.scaleQuantize().domain([0, 1]).range(quantizedColorRange)
    : undefined

  const getColor = useCallback(
    (id) => {
      // we're not highlighting any cluster at the moment
      if (!activeClusterId) return hueScale(id)

      // otherwise we're highlighting a cluster
      // --
      // if we're in the source network...
      if (id === activeCluster.cluster_id) {
        return hueScale(id)
      }
      // but if we're not in the source network, we must find
      // source network similarities in target network
      const similarityWithHighlightedCluster =
        activeCluster.similarities[id] * 1000

      if (
        similarityWithHighlightedCluster &&
        similarityWithHighlightedCluster > MIN_SIMILARITY_THRESHOLD
      ) {
        const similarityScaleValue = similarityScale(
          similarityWithHighlightedCluster
        )

        return similarityScaleValue
      }

      return NO_OVERLAP_COLOR
    },
    [hueScale]
  )

  // we should set initial zoom here
  // -- how can we fit to objects bounds?
  // -- maybe do some calculation with group?
  function setInitialZoom() {
    set({ cameraZoom: INITIAL_ZOOM })
  }

  function resetView() {
    set({ cameraPosition: SCENE_CENTER })
    setInitialZoom()
  }

  // move to programmatically
  function moveTo({ location, zoom }) {
    let targetLocation = location

    // do not f*cking comment this
    if (!location[0] || !location[1]) targetLocation = [0, 0]

    set({ cameraPosition: targetLocation, cameraZoom: zoom })
    // setTargetZoom(zoom)
  }

  function handleClusterClick(d) {
    const { cluster_id /* , cluster_original */ } = d

    let payload

    payload = {
      networks: {
        highlight: cluster_id,
        nameHighlight: cluster_id,
      },
    }

    if (cluster_id === layout.networks.nameHighlight) {
      payload = {
        networks: {
          highlight: null,
          nameHighlight: null,
        },
      }
    }

    dispatch({
      type: 'UPDATE_NETWORK_STATE',
      payload,
    })
  }

  useEffect(() => {
    // if we're not highlighting we reset the view
    if (!activeCluster) {
      resetView()
      return
    }

    const targetZoomLevel = isNaN(+zoomLevel) ? ZOOMED_IN : +zoomLevel
    const activeClusterIsInThisNetwork =
      activeCluster.network === dataset.clusters[0].network

    // we only zoom and pan if we're in source network
    if (activeClusterIsInThisNetwork) {
      // we move to its cluster centroid...
      const {
        pca_centroid: [cx, cy],
      } = activeCluster

      const centroidX = xScale(cx)
      const centroidY = -yScale(cy)
      const screenCoordsCentroid = [centroidX, centroidY]

      moveTo({ location: screenCoordsCentroid, zoom: targetZoomLevel })
      return
      //
    } else {
      // otherwise we have to find the matching clusters
      const matchingClusters = dataset.allClusters.filter(
        ({ cluster_id }: ClusterObjectProps) => {
          const similarity = activeCluster.similarities[cluster_id]
          return similarity > MIN_SIMILARITY_THRESHOLD
        }
      )
      const matchingClustersCentroids = matchingClusters.map(
        (c: ClusterObjectProps) => c.pca_centroid
      )
      // we compute the centroid of all the matching polygons
      const [x, y] = polygonCentroid(matchingClustersCentroids)
      const rescaledCentroidCoords = [xScale(x), -yScale(y)]
      moveTo({ location: rescaledCentroidCoords, zoom: INITIAL_ZOOM })
    }
  }, [activeClusterId])

  useEffect(() => {
    // we only want to set legend state once
    if (!isSourceNetwork) return

    const legend = [NO_OVERLAP_COLOR].concat(quantizedColorRange)

    dispatch({
      type: 'SET_LEGEND',
      payload: { legend },
    })
  }, [highlightColor])

  //
  // **
  // render state changes
  useFrame(() => {
    // updating zoom
    if (!cameraRef.current) return
    const z = cameraRef.current.zoom
    const currentZoom = round(z)
    const isAtTargetZoom = currentZoom === round(cameraZoom)

    if (cameraZoom) {
      cameraRef.current.zoom = lerp(z, cameraZoom, LERP_FACTOR)
      cameraRef.current.updateProjectionMatrix()
    } else if (isAtTargetZoom && cameraZoom !== null) {
      set({ cameraZoom: null })
    }

    // updating position
    if (!groupRef.current) return
    const x = groupRef.current.position.x
    const y = groupRef.current.position.y
    const isAtX = round(x) === cameraPosition[0]
    const isAtY = round(x) === cameraPosition[1]
    const isAtTargetPosition = isAtX && isAtY

    if (!isAtTargetPosition) {
      const cameraX = -cameraPosition[0]
      const cameraY = cameraPosition[1]

      groupRef.current.position.x = lerp(x, cameraX, LERP_FACTOR)
      groupRef.current.position.y = lerp(y, cameraY, LERP_FACTOR)
    } else if (isAtTargetPosition && cameraPosition !== null) {
      set({ cameraPosition: null })
    }
  })

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        // position={[cameraPosition[0], -cameraPosition[1], 10]}
        zoom={INITIAL_ZOOM}
        // up={[0, 0, 1]}
      />
      {/* <MapControls
        enabled={false}
        enablePan
        enableRotate
        enableZoom
        enableDamping
        // camera={cameraRef.current}
        // position={new Vector3(cameraPosition[0], cameraPosition[1], 0)}
      /> */}
      {/* {isDevelopment && <ambientLight intensity={0.5} />} */}
      {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} /> */}
      <group
        ref={groupRef}
        // position={[0, 0, 0]}
        // rotation={[
        //   MathUtils.degToRad(0),
        //   MathUtils.degToRad(0),
        //   MathUtils.degToRad(0),
        // ]}
      >
        {dataset &&
          dataset.clusters.map((d: ClusterObjectProps, i) => {
            const color = getColor(d.cluster_id)

            const showLabel =
              !activeCluster ||
              (activeCluster && activeCluster.cluster_id === d.cluster_id) ||
              (activeCluster && activeCluster.similarities[d.cluster_id] > 0)

            return (
              <Cluster
                key={i}
                data={d}
                scales={{ xScale, yScale }}
                color={color}
                label={showLabel}
                cameraRef={cameraRef}
                onClick={() => handleClusterClick(d)}
              />
            )
          })}
      </group>
    </>
  )
}

export default Scene
