import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  MutableRefObject,
  Ref,
} from 'react'

import { Box3, MathUtils, Vector3 } from 'three'
import { Canvas, OrthographicCameraProps, useFrame } from '@react-three/fiber'
import {
  OrthographicCamera,
  MapControls,
  useContextBridge,
  Html,
} from '@react-three/drei'

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
  randomColor,
} from 'utils/math'

import {
  groupDatapointsByCluster,
  rankedClusters,
} from 'utils/dataManipulations'

/* const allClusterIDs = new Set(
  rankedClusters.map((d) => ({
    network: d.network,
    cluster_id: d.cluster_id
  }))
) */

const MIN_SIMILARITY_THRESHOLD = 0

const SCENE_CENTER = [0, 0]
const INITIAL_ZOOM = 5
const ZOOMED_IN = 8
const BASE_POINT_SIZE = 1
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
  accessor: 'left' | 'right' | 'source' | 'target'
}

const SingleNetwork = ({ data, accessor }) => {
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
      <div
        style={{
          position: 'absolute',
          zIndex: 20,
          top: '50%',
          left: '50%',
          color: 'red',
          transform: 'scale(2)',
        }}
      >
        +
      </div>
      <Canvas ref={canvasRef}>
        <ContextBridge>
          {dataset && (
            <Scene
              dataset={dataset}
              sourceNetwork={isSourceNetwork}
              forwardRef={canvasRef}
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
  sourceNetwork: boolean
  forwardRef: Ref<HTMLCanvasElement>
}

const Scene = ({ dataset, sourceNetwork, forwardRef }: SceneProps) => {
  const [layout] = useVizLayout()

  //
  const [targetZoom, setTargetZoom] = useState(null)
  const [targetPosition, setTargetPosition] = useState(SCENE_CENTER)
  //
  const cameraRef = useRef(null)
  const groupRef = useRef(null)
  //
  const highlightedClusterIndex = layout.networks.highlight
  const highlightedCluster = layout?.clusters[layout.networks.highlight] || null

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

  // const colorScale = useMemo(() => {
  //   () => d3.scale
  // }, [dataset])

  const allClustersID = dataset.allClusters.map(
    (d: ClusterObjectProps) => d.cluster_id
  )

  const colorScale = useMemo(
    () =>
      d3
        .scaleQuantize()
        .domain(d3.extent(allClustersID))
        .range(d3.quantize(d3.interpolateTurbo, allClustersID.length)),
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
      if (!highlightedClusterIndex) return colorScale(id)

      // otherwise we're highlighting a cluster
      if (id === highlightedCluster.cluster_id) return colorScale(id)

      // but if we're not in the source network, we must find
      // source network highlighted cluster similarities

      const similarityWithHighlightedCluster =
        highlightedCluster.similarities[id]

      if (
        similarityWithHighlightedCluster &&
        similarityWithHighlightedCluster > MIN_SIMILARITY_THRESHOLD
      ) {
        return colorScale(highlightedCluster.cluster_id)
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
  function setInitialZoom() {
    // const boundingBox = new Box3()
    // boundingBox.setFromObject(groupRef.current)

    // const size = boundingBox.getSize(new Vector3())
    // // const center = boundingBox.getCenter(new Vector3())

    // const maxDim = Math.max(size.x, size.y, size.z)
    // const fov = 6 * (Math.PI / 180)

    // const cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2))

    setTargetZoom(INITIAL_ZOOM)
  }

  function resetView() {
    setTargetPosition(SCENE_CENTER)
    setInitialZoom()
  }

  function moveTo({ location, zoom }) {
    let targetLocation = [location[0], location[1]]

    if (!location[0] || !location[1]) targetLocation = [0, 0]

    setTargetPosition(targetLocation)
    setTargetZoom(zoom)
  }

  // handle change of block and chapter
  useEffect(() => {
    if (!highlightedCluster) {
      resetView()
      return
    }

    if (sourceNetwork) {
      // if sourceNetwork we move to its cluster centroid...
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

    // has to return an array of centroids
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

    const targetCenterRescaled = [xScale(x), yScale(y)]

    moveTo({ location: targetCenterRescaled, zoom: ZOOMED_IN })
  }, [highlightedClusterIndex])

  //
  // **
  // runtime operations

  useFrame(() => {
    const z = cameraRef.current.zoom
    const currentZoom = round(z)
    const isAtTargetZoom = currentZoom === round(targetZoom)

    if (targetZoom) {
      cameraRef.current.zoom = lerp(z, targetZoom, LERP_FACTOR)
      cameraRef.current.updateProjectionMatrix()
    } else if (isAtTargetZoom && targetZoom !== null) {
      setTargetZoom(null)
    }
    const [x, y] = [groupRef.current.position.x, groupRef.current.position.y]
    const isAtTargetPosition =
      round(x) === targetPosition[0] && round(y) === targetPosition[1]
    if (!isAtTargetPosition) {
      groupRef.current.position.x = lerp(x, targetPosition[0], LERP_FACTOR)
      groupRef.current.position.y = lerp(y, targetPosition[1], LERP_FACTOR)
    }
  })

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[0, 0, -10]}
        zoom={INITIAL_ZOOM}
        // up={[0, 0, 1]}
      />
      <MapControls
        enabled={false}
        enablePan
        enableRotate
        enableZoom
        enableDamping
      />
      {/* <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} /> */}
      <group
        ref={groupRef}
        position={[0, 0, 10]}
        rotation={[
          MathUtils.degToRad(0),
          MathUtils.degToRad(0),
          MathUtils.degToRad(90),
        ]}
      >
        {dataset &&
          dataset.clusters.map((d: ClusterObjectProps, i) => {
            const color = getColor(d.cluster_id)

            return (
              <Cluster
                key={i}
                data={d}
                scales={{ xScale, yScale }}
                color={color}
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
  cameraRef: MutableRefObject<OrthographicCameraProps>
  onClick?: (e: any) => void
}

const Cluster = ({ data, scales, color, cameraRef, onClick }: ClusterProps) => {
  const { xScale, yScale } = scales

  const [labelPosition, setLabelPosition] = useState(null)

  const pointsRef = useRef(null)
  const pointMaterialRef = useRef(null)

  const subDataset = data.nodes
  const numPoints = subDataset.length

  const positions = useMemo(
    () => datasetCoordsToArrayOfPoints({ dataset: subDataset, xScale, yScale }),
    [subDataset, numPoints]
  )

  const [cx, cy] = data.centroid
  const [ax, ay] = [xScale(cx), yScale(cy)]

  useEffect(() => {
    if (!pointsRef.current) return

    const boundingBox = new Box3()
    boundingBox.setFromObject(pointsRef.current)

    // const size = boundingBox.getSize(new Vector3())
    const center = boundingBox.getCenter(new Vector3())

    setLabelPosition(center)
  }, [pointsRef.current])

  useFrame(() => {
    //pointMaterialRef.current.size = lerp(pointMaterialRef.current.size, BASE_POINT_SIZE + cameraRef.current.zoom / 10, LERP_FACTOR)
    pointMaterialRef.current.size =
      BASE_POINT_SIZE + cameraRef.current.zoom / 20
    // // set material color
    // if (clusterId === 0) {
    //   pointMaterialRef.current.color = new Color(
    //     Math.sin(clock.getElapsedTime()),
    //     Math.sin(clock.getElapsedTime()),
    //     Math.cos(clock.getElapsedTime())
    //   )
    // }
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
      {labelPosition && (
        <group position={labelPosition}>
          <Html
            as="div" // Wrapping element (default: 'div')
            // wrapperClass // The className of the wrapping element (default: undefined)
            // prepend // Project content behind the canvas (default: false)
            center // Adds a -50%/-50% css transform (default: false) [ignored in transform mode]
            // fullscreen // Aligns to the upper-left corner, fills the screen (default:false) [ignored in transform mode]
            distanceFactor={30} // If set (default: undefined), children will be scaled by this factor, and also by distance to a PerspectiveCamera / zoom by a OrthographicCamera.
            zIndexRange={[100, 0]} // Z-order range (default=[16777271, 0])
            // portal={domnodeRef} // Reference to target container (default=undefined)
            transform // If true, applies matrix3d transformations (default=false)
            sprite // Renders as sprite, but only in transform mode (default=false)
            // calculatePosition={() => [ax, ay]} // Override default positioning function. (default=undefined) [ignored in transform mode]
            // occlude={[ref]} // Can be true or a Ref<Object3D>[], true occludes the entire scene (default: undefined)
            // onOcclude={(visible) => null} // Callback when the visibility changes (default: undefined)
            // {...groupProps} // All THREE.Group props are valid
            // {...divProps} // All HTMLDivElement props are valid
          >
            <h2>{data.name}</h2>
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
          /* sizeAttenuation={true} alphaTest={0.5} transparent={true} */
        />
      </points>
    </group>
  )
}

export default SingleNetwork
