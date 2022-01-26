import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  MutableRefObject,
  Ref,
} from 'react'

import { Box3, Color, MathUtils, Vector3 } from 'three'
import { Canvas, OrthographicCameraProps, useFrame } from '@react-three/fiber'
import {
  OrthographicCamera,
  MapControls,
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

import {
  groupDatapointsByCluster,
  rankedClusters,
} from 'utils/dataManipulations'

import { showUiControls } from 'utils/index'

import Spinner from 'components/atoms/spinner'

/* const allClusterIDs = new Set(
  rankedClusters.map((d) => ({
    network: d.network,
    cluster_id: d.cluster_id
  }))
) */

// for testing purposes

function Box(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef(null)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      // onClick={(event) => click(!clicked)}
      // onPointerOver={(event) => hover(true)}
      // onPointerOut={(event) => hover(false)}
    >
      <sphereGeometry args={[1, 20, 20]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const MIN_SIMILARITY_THRESHOLD = 0

const SCENE_CENTER = [0, 0]
const INITIAL_ZOOM = 5
const MAX_ZOOM = 60
const ZOOMED_IN = 8
const BASE_POINT_SIZE = 1
const BASE_LABEL_SCALE = 4
const LERP_FACTOR = 0.1

// sub-types

interface DatasetProps {
  clusters: object[]
  allClusters: object[]
  extent: { x: number[]; y: number[] }
}

// components

interface SingleNetwork {
  data: object[]
  activeCluster: number | null
  accessor: 'left' | 'right' | 'source' | 'target'
}

const SingleNetwork = ({ data, activeCluster, accessor }) => {
  const [layout] = useVizLayout()

  const ContextBridge = useContextBridge(VizLayoutContext)
  //
  const [fetching, setFetching] = useState<boolean>(true)
  const [dataset, setDataset] = useState<DatasetProps>(null)
  //
  const canvasRef = useRef<HTMLCanvasElement>(null)
  //
  const accessorKey: string = `${accessor}_network_shapefile`
  // is this the network on the left? or on the right?
  // we can find out with its accessor
  const isSourceNetwork: boolean = accessor === 'source' || accessor === 'left'

  const highlightedCluster: ClusterObjectProps =
    layout?.clusters[activeCluster] || null

  //
  // **
  // runtime

  const fetchNetwork = async () => {
    setFetching(true)

    const { asset }: { asset: { path: string } } = data.networks[accessorKey]

    const options = { headers: { accepts: 'application/json' } }

    let dataset

    try {
      dataset = await fetch(
        `https://api.sanity.io/${asset.path}`,
        options
      ).then((r) => r.json())
    } catch {
      const { source_network_id, target_network_id } = data.networks
      const localFile = isSourceNetwork
        ? `${source_network_id}_nodes.json`
        : `${target_network_id}_nodes.json`

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
  }, [layout.story.chapter])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {fetching && <Spinner />}
      {showUiControls && (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            top: '50%',
            left: '50%',
            color: 'red',
            transform: 'translate(-50%,-50%) scale(3)',
            fontWeight: '100',
          }}
        >
          +
        </div>
      )}
      <Canvas ref={canvasRef}>
        <ContextBridge>
          {dataset && (
            <Scene
              dataset={dataset}
              networkName={accessor}
              activeCluster={activeCluster}
              highlightedCluster={highlightedCluster}
              isSourceNetwork={isSourceNetwork}
            />
          )}
        </ContextBridge>
      </Canvas>
    </div>
  )
}

// Scene

interface SceneProps {
  dataset: DatasetProps
  networkName: string
  activeCluster: number
  highlightedCluster: ClusterObjectProps
  isSourceNetwork: boolean
  forwardRef?: Ref<HTMLCanvasElement>
}

const Scene = ({
  dataset,
  networkName,
  activeCluster,
  highlightedCluster,
  isSourceNetwork,
}: SceneProps) => {
  const [layout] = useVizLayout()

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
    [dataset]
  )
  const yScale = useMemo(
    () => d3.scaleLinear().domain(dataset.extent.y).range([-55, 55]),
    [dataset]
  )

  const allClustersID = dataset.allClusters.map(
    (d: ClusterObjectProps) => d.cluster_id
  )

  const colorScale = useMemo(
    () =>
      d3
        .scaleQuantize()
        .domain(d3.extent(allClustersID))
        .range(d3.quantize(d3.interpolateSinebow, allClustersID.length)),
    [allClustersID]
  )

  // const randomColors = useMemo(
  //   () => allClustersID.map((id: number) => [id, randomColor()]),
  //   []
  // )

  // colorScale = useMemo(
  //   () => (tid: number) => Object.fromEntries(randomColors)[tid],
  //   [allClustersID]
  // )

  const getColor = useCallback(
    (id) => {
      // we're not highlighting any cluster at the moment
      if (!activeCluster) return colorScale(id)

      // otherwise we're highlighting a cluster
      // --
      // if we're in the source network...
      if (id === highlightedCluster.cluster_id) {
        return colorScale(id)
      }
      // but if we're not in the source network, we must find
      // source network similarities in target network
      const similarityWithHighlightedCluster =
        highlightedCluster.similarities[id]

      if (
        similarityWithHighlightedCluster &&
        similarityWithHighlightedCluster > MIN_SIMILARITY_THRESHOLD
      ) {
        return colorScale(highlightedCluster.cluster_id)
        // return d3
        //   .scaleLinear()
        //   .domain([0, 1])
        //   .range(['#000000', colorScale(highlightedCluster.cluster_id)])(
        //   similarityWithHighlightedCluster
        // )
      }

      return '#333333'
    },
    [colorScale]
  )

  // here we'll highlight cluster in explore mode
  function handleClusterClick(e) {
    function animateToRandomPoint() {
      const randZ = round(INITIAL_ZOOM + Math.random() * 100)

      const [randX, randY] = [
        round((Math.random() - 0.5) * 15),
        round((Math.random() - 0.5) * 15),
      ]

      moveTo({ location: [randX, randY], zoom: randZ })
    }

    animateToRandomPoint()
  }

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
    if (!highlightedCluster) {
      resetView()
      return
    }

    // if we're in source network...
    if (isSourceNetwork) {
      // we move to its cluster centroid...
      const {
        centroid: [cx, cy],
      } = highlightedCluster

      const screenCoordsCentroid = [xScale(cx), yScale(cy)]

      moveTo({ location: screenCoordsCentroid, zoom: ZOOMED_IN })
      return
    }
    // otherwise we zoom to the corresponding clusters centroids
    // - how the f*ck can I do this?
    // console.log(highlightedCluster.similarities)

    // - this has to return an array of centroids
    const matchingClusters = layout.clusters.filter(
      ({ cluster_id }: ClusterObjectProps) => {
        const similarity = highlightedCluster.similarities[cluster_id]
        return similarity > MIN_SIMILARITY_THRESHOLD
      }
    )

    const matchingClustersCentroids = matchingClusters.map(
      (c: ClusterObjectProps) => c.centroid
    )

    const [x, y] = polygonCentroid(matchingClustersCentroids)

    // const [x, y] = matchingClustersCentroids[0]

    const screenCoordsCentroids = [xScale(x), yScale(y)]

    moveTo({ location: screenCoordsCentroids, zoom: ZOOMED_IN })
  }, [activeCluster])

  //
  // **
  // runtime operations
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
      <MapControls
        enabled={false}
        enablePan
        enableRotate
        enableZoom
        enableDamping
        // camera={cameraRef.current}
        // position={new Vector3(cameraPosition[0], cameraPosition[1], 0)}
      />
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
              !highlightedCluster ||
              (highlightedCluster &&
                highlightedCluster.cluster_id === d.cluster_id) ||
              (highlightedCluster &&
                highlightedCluster.similarities[d.cluster_id] > 0)

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

interface ClusterProps {
  key: number
  data: {
    name?: string
    cluster_id?: number
    centroid?: [number, number]
    nodes?: any[]
  }
  scales: {
    xScale: (a: number) => number
    yScale: (a: number) => number
  }
  color: string | number
  label: boolean
  cameraRef: MutableRefObject<OrthographicCameraProps>
  onClick?: (e: any) => void
}

const Cluster = ({ data, scales, color, label, onClick }: ClusterProps) => {
  const { xScale, yScale } = scales

  const [mounted, setMounted] = useState(false)

  const [cx, cy] = data.centroid
  const labelPosition = new Vector3(xScale(cx), -yScale(cy), -10)

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
      BASE_POINT_SIZE + camera.zoom / 10,
      LERP_FACTOR
    )

    if (!mounted) return
    const z = BASE_LABEL_SCALE - (camera.zoom * 3.5) / MAX_ZOOM
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
            <h2 ref={labelRef}>{data.name}</h2>
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
