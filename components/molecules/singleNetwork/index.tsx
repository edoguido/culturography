import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  MutableRefObject,
  Ref,
} from 'react'

import { Color, Vector3 } from 'three'
import { Canvas, OrthographicCameraProps, useFrame } from '@react-three/fiber'
import {
  OrthographicCamera,
  // MapControls,
  useContextBridge,
  Html,
} from '@react-three/drei'

import { useControls } from 'leva'

import * as d3 from 'd3'

//

import {
  ClusterObjectProps,
  useVizLayout,
  VizLayoutContext,
} from '@/context/vizLayoutContext'
// import { apiFetch } from 'utils/cms'

import {
  round,
  lerp,
  datasetCoordsToArrayOfPoints,
  polygonCentroid,
} from 'utils/math'

import { groupDatapointsByCluster, rankedClusters } from 'utils/data'

import { hideUiControls /* , isDevelopment */ } from 'utils/index'

import Spinner from 'components/atoms/spinner'
import { motion } from 'framer-motion'

// for testing purposes
// function Box(props) {
//   // This reference gives us direct access to the THREE.Mesh object
//   const ref = useRef(null)
//   // Subscribe this component to the render-loop, rotate the mesh every frame
//   // useFrame((state, delta) => (ref.current.rotation.x += 0.01))
//   // Return the view, these are regular Threejs elements expressed in JSX
//   return (
//     <mesh
//       {...props}
//       ref={ref}
//       // onClick={(event) => click(!clicked)}
//       // onPointerOver={(event) => hover(true)}
//       // onPointerOut={(event) => hover(false)}
//     >
//       <sphereGeometry args={[1, 20, 20]} />
//       <meshStandardMaterial color={'orange'} />
//     </mesh>
//   )
// }

const MIN_SIMILARITY_THRESHOLD = 0
// camera
const SCENE_CENTER = [0, 0]
const INITIAL_ZOOM = 5
const MAX_ZOOM = 60
const ZOOMED_IN = 6
// appearance
const BASE_POINT_SIZE = 1
const BASE_LABEL_SCALE = 4
const COLOR_LEVELS = 4
const NO_OVERLAP_COLOR = '#222222'
// motion
const LERP_FACTOR = 0.05

// sub-types

interface DatasetProps {
  clusters: ClusterObjectProps[]
  allClusters: object[]
  extent: { x: number[]; y: number[] }
}

// components

interface SingleNetwork {
  data: object[]
  activeCluster: ClusterObjectProps
  activeClusterId: number | null
  accessor: 'source' | 'target'
}

const SingleNetwork = ({ data, activeCluster, activeClusterId, accessor }) => {
  const [layout] = useVizLayout()

  const ContextBridge = useContextBridge(VizLayoutContext)
  //
  const [fetching, setFetching] = useState<boolean>(true)
  const [dataset, setDataset] = useState<DatasetProps>(null)
  //
  const canvasRef = useRef<HTMLCanvasElement>(null)
  //
  const accessorKey: string = `${accessor}_network_shapefile`
  const networkName: string = data.networks[`${accessor}_network_name`]
  const zoomLevel: string = layout.networks[accessor].zoomLevel
  //
  // is this the network on the left? or on the right?
  // we can find out with its accessor
  const isSourceNetwork: boolean = accessor === 'source'

  //
  // **
  // runtime

  const fetchNetwork = async () => {
    setFetching(true)

    const { asset }: { asset: { path: string } } = data.networks[accessorKey]

    const options = {
      method: 'GET',
      mode: 'no-cors' as RequestMode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        accepts: 'application/json',
      },
    }

    let dataset

    try {
      dataset = await fetch(
        `https://api.sanity.io/${asset.path}`,
        options
      ).then((r) => r.json())
    } catch {
      const { source_network_id, target_network_id } = data.networks

      console.warn("Couldn't fetch from Sanity CDN. Sourcing local files...")
      const localFile = isSourceNetwork
        ? `${source_network_id}_${layout.story.phase}_nodes.json`
        : `${target_network_id}_${layout.story.phase}_nodes.json`

      dataset = fetch(`/data/${localFile}`).then((r) => r.json())
    }

    setFetching(false)

    return dataset
  }

  const prepareNetwork = (dataset) => {
    if (!dataset) throw new Error('No dataset fetched')

    const clusters = rankedClusters(layout.clusters)
    const groupedDataset = groupDatapointsByCluster({ dataset, clusters })

    const xExtent = d3.extent(dataset, (d) => d.x)
    const yExtent = d3.extent(dataset, (d) => d.y)

    setDataset({
      clusters: groupedDataset,
      allClusters: clusters,
      extent: { x: xExtent, y: yExtent },
    })
  }

  // initiate app
  useEffect(() => {
    fetchNetwork().then(prepareNetwork).catch(console.error)
    return () => setDataset(null)
  }, [layout.story.chapter])

  return (
    <div className="relative w-full h-full">
      {fetching && <Spinner />}
      <NetworkName label={networkName} />
      <Cursor />
      <Canvas ref={canvasRef}>
        <ContextBridge>
          {!fetching && dataset && (
            <Scene
              dataset={dataset}
              networkName={accessor}
              activeClusterId={activeClusterId}
              activeCluster={activeCluster}
              isSourceNetwork={isSourceNetwork}
              zoomLevel={zoomLevel}
            />
          )}
        </ContextBridge>
      </Canvas>
    </div>
  )
}

const NetworkName = ({ label }: { label: string }) => {
  return (
    <motion.h3 className="absolute z-30 bg-white bg-opacity-10 text-white font-medium tracking-wider py-1 px-3 rounded-br-2xl">
      {label}
    </motion.h3>
  )
}

const Cursor = () => {
  return (
    hideUiControls && (
      <div className="absolute z-20 top-1/2 left-1/2 text-red-500 -translate-x-1/2 -translate-y-1/2">
        +
      </div>
    )
  )
}

// Scene

interface SceneProps {
  dataset: DatasetProps
  networkName: string
  activeClusterId: number
  activeCluster: ClusterObjectProps
  isSourceNetwork: boolean
  zoomLevel: string
  forwardRef?: Ref<HTMLCanvasElement>
}

const Scene = ({
  dataset,
  networkName,
  activeClusterId,
  activeCluster,
  isSourceNetwork,
  zoomLevel,
}: SceneProps) => {
  const [_, dispatch] = useVizLayout()

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
  //

  // const canvasWidth = forwardRef.current.clientWidth
  // const canvasHeight = forwardRef.current.clientHeight

  //
  // scales
  const xScale = useMemo(
    () => d3.scaleLinear().domain(dataset.extent.x).range([-55, 55]),
    [networkName]
  )
  const yScale = useMemo(
    () => d3.scaleLinear().domain(dataset.extent.y).range([-55, 55]),
    [networkName]
  )

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
      d3.quantize(d3.scaleLinear().range(['white', targetColor]), COLOR_LEVELS),
    []
  )

  const highlightColor = activeCluster
    ? hueScale(activeCluster.cluster_id)
    : null

  const quantizedColorRange = activeCluster
    ? intensityColorScaleQuantized(highlightColor)
    : null

  const similarityScale = activeCluster
    ? d3.scaleQuantize().domain([0, 1]).range(quantizedColorRange)
    : null

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

  // // here we'll highlight cluster in explore mode
  // function handleClusterClick(e) {
  //   function animateToRandomPoint() {
  //     const randZ = round(INITIAL_ZOOM + Math.random() * 100)

  //     const [randX, randY] = [
  //       round((Math.random() - 0.5) * 15),
  //       round((Math.random() - 0.5) * 15),
  //     ]

  //     moveTo({ location: [randX, randY], zoom: randZ })
  //   }

  //   animateToRandomPoint()
  // }

  // we should set initial zoom here
  // -- how can we fit to objects bounds?
  // -- maybe do some calculation with group?
  function setInitialZoom() {
    // const boundingBox = new Box3()
    // boundingBox.setFromObject(groupRef.current)

    // const size = boundingBox.getSize(new Vector3())
    // // const center = boundingBox.getCenter(new Vector3())

    // const maxDim = Math.max(size.x, size.y, size.z)
    // const fov = 6 * (Math.PI / 180)

    // const cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2))

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

  // handle change of block and chapter
  useEffect(() => {
    // if we're not highlighting we reset the view
    if (!activeCluster) {
      resetView()
      return
    }

    const targetZoomLevel = isNaN(+zoomLevel) ? ZOOMED_IN : +zoomLevel
    const activeClusterIsInThisNetwork =
      activeCluster.network === dataset.clusters[0].network

    // if we're in source network...
    if (isSourceNetwork && activeClusterIsInThisNetwork) {
      // we move to its cluster centroid...
      const {
        pca_centroid: [cx, cy],
      } = activeCluster

      const screenCoordsCentroid = [xScale(cx), -yScale(cy)]

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

      moveTo({ location: rescaledCentroidCoords, zoom: ZOOMED_IN })
    }
  }, [activeClusterId])

  useEffect(() => {
    if (isSourceNetwork) {
      dispatch({
        type: 'SET_LEGEND',
        payload: { legend: [NO_OVERLAP_COLOR].concat(quantizedColorRange) },
      })
    }
  }, [highlightColor])

  //
  // **
  // frame operations
  useFrame(() => {
    // updating zoom
    if (cameraRef.current) {
      const z = cameraRef.current.zoom
      const currentZoom = round(z)
      const isAtTargetZoom = currentZoom === round(cameraZoom)

      if (cameraZoom) {
        cameraRef.current.zoom = lerp(z, cameraZoom, LERP_FACTOR)
        cameraRef.current.updateProjectionMatrix()
      } else if (isAtTargetZoom && cameraZoom !== null) {
        set({ cameraZoom: null })
      }
    }

    // updating position
    if (groupRef.current) {
      const [x, y] = [groupRef.current.position.x, groupRef.current.position.y]
      const isAtTargetPosition =
        round(x) === cameraPosition[0] && round(y) === cameraPosition[1]
      if (!isAtTargetPosition) {
        groupRef.current.position.x = lerp(x, -cameraPosition[0], LERP_FACTOR)
        groupRef.current.position.y = lerp(y, cameraPosition[1], LERP_FACTOR)
      } else if (isAtTargetPosition && cameraPosition !== null) {
        set({ cameraPosition: null })
      }
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
                // onClick={handleClusterClick}
              />
            )
          })}
      </group>
    </>
  )
}

// Cluster

interface ClusterVisualization {
  key: number
  data: ClusterObjectProps
  scales: {
    xScale: (a: number) => number
    yScale: (a: number) => number
  }
  color: Color | string | number
  label: boolean
  cameraRef: MutableRefObject<OrthographicCameraProps>
  onClick?: (e: any) => void
}

const Cluster = ({
  data,
  scales,
  color,
  label,
  onClick,
}: ClusterVisualization) => {
  const { xScale, yScale } = scales

  const [mounted, setMounted] = useState(false)

  const [cx, cy] = data.pca_centroid
  const labelPosition = new Vector3(xScale(cx), yScale(cy), 0)

  const labelRef = useRef(null)
  const pointsRef = useRef(null)
  const pointMaterialRef = useRef(null)

  const subDataset = data.nodes
  const numPoints = subDataset.length

  const positions = useMemo(
    () => datasetCoordsToArrayOfPoints({ dataset: subDataset, xScale, yScale }),
    [subDataset, numPoints]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useFrame(({ camera }) => {
    pointMaterialRef.current.size = lerp(
      pointMaterialRef.current.size,
      BASE_POINT_SIZE + camera.zoom / 20,
      LERP_FACTOR
    )

    if (!mounted) return
    const z = BASE_LABEL_SCALE - camera.zoom / MAX_ZOOM
    labelRef.current.style.transform = `scale3d(${z},${z},${z})`

    const o = labelRef.current.style.opacity
    if (label) {
      labelRef.current.style.opacity = lerp(o, 1, LERP_FACTOR)
    } else {
      labelRef.current.style.opacity = lerp(o, 0, LERP_FACTOR)
    }
  })

  /* function handlePointerEnter() {
    document.documentElement.style.cursor = 'pointer'
  }

  function handlePointerOut() {
    document.documentElement.style.cursor = ''
  } */

  // const normalizeCoords = ([x,y]) => {
  //   return []
  // }

  return (
    <group onClick={onClick}>
      {labelPosition && pointsRef.current && (
        <group position={labelPosition}>
          {/* {isDevelopment && <Box position={[0, 0, -20]} scale={1} />} */}
          <Html
            as="div" // Wrapping element (default: 'div')
            // wrapperClass // The className of the wrapping element (default: undefined)
            // prepend // Project content behind the canvas (default: false)
            // center // Adds a -50%/-50% css transform (default: false) [ignored in transform mode]
            // fullscreen // Aligns to the upper-left corner, fills the screen (default:false) [ignored in transform mode]
            // distanceFactor={30} // If set (default: undefined), children will be scaled by this factor, and also by distance to a PerspectiveCamera / zoom by a OrthographicCamera.
            zIndexRange={[50, 10]} // Z-order range (default=[16777271, 0])
            // portal={domnodeRef} // Reference to target container (default=undefined)
            transform // If true, applies matrix3d transformations (default=false)
            // sprite // Renders as sprite, but only in transform mode (default=false)
            // calculatePosition={() => [ax, ay]} // Override default positioning function. (default=undefined) [ignored in transform mode]
            // occlude={[ref]} // Can be true or a Ref<Object3D>[], true occludes the entire scene (default: undefined)
            // onOcclude={(visible) => null} // Callback when the visibility changes (default: undefined)
            // {...groupProps} // All THREE.Group props are valid
            // {...divProps} // All HTMLDivElement props are valid
          >
            <h2 ref={labelRef} className="text-3xl font-medium">
              {data.name}
            </h2>
          </Html>
        </group>
      )}

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={numPoints}
            itemSize={3}
            array={positions}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointMaterialRef}
          color={color}
          size={BASE_POINT_SIZE}
          sizeAttenuation={true}
          alphaTest={0.5}
          transparent={true}
        />
      </points>
    </group>
  )
}

export default SingleNetwork
