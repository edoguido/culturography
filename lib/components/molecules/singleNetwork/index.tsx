import { useEffect, useMemo, useRef, useState, MutableRefObject } from 'react'

import { Canvas, OrthographicCameraProps, useFrame } from '@react-three/fiber'

import {
  OrthographicCamera,
  MapControls,
  useContextBridge,
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
  randomColor,
  datasetCoordsToArrayOfPoints,
  polygonCenter,
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

const MIN_SIMILARITY_THRESHOLD = 0.1

const INITIAL_ZOOM = 6
const LERP_FACTOR = 0.1

// sub-types

interface DatasetProps {
  clusters: object[]
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
  const accessorKey: string = `${accessor}_network_shapefile`
  // is this the network on the left? or on the right?
  // we can find out with its accessor
  const isSourceNetwork: boolean = accessor === 'source' || accessor === 'left'
  //
  // **
  // runtime

  const fetchNetwork = async () => {
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

    setDataset({ clusters: groupedDataset, extent: { x: xExtent, y: yExtent } })
  }

  // initiate app
  useEffect(() => {
    fetchNetwork().then(prepareNetwork).catch(console.error)
  }, [layout.story.chapter])

  // // update canvas on resize
  // useEffect(() => {
  //   // should also be called with resizeObserver
  //   window.addEventListener('resize', handleResize)
  //   return () => window.removeEventListener('resize', handleResize)
  // }, [wrapperRef])

  // useEffect(() => {
  //   updatePointsColor()
  // }, [layout.story.block])

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
      <Canvas>
        <ContextBridge>
          {dataset && (
            <Scene dataset={dataset} sourceNetwork={isSourceNetwork} />
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
}

const Scene = ({ dataset, sourceNetwork }: SceneProps) => {
  const [layout] = useVizLayout()

  //
  const [targetZoom, setTargetZoom] = useState(INITIAL_ZOOM)
  const [targetPosition, setTargetPosition] = useState(SCENE_CENTER)
  //
  const ref = useRef(null)
  const groupRef = useRef(null)
  //
  const highlightedClusterIndex = layout.networks.highlight
  const highlightedCluster = layout?.clusters[layout.networks.highlight] || null
  //
  // scales
  const xScale = useMemo(
    () => d3.scaleLinear().domain(dataset.extent.x).range([-50, 50]),
    [dataset]
  )
  const yScale = useMemo(
    () => d3.scaleLinear().domain(dataset.extent.y).range([-50, 50]),
    [dataset]
  )

  function resetView() {
    setTargetPosition(SCENE_CENTER)
    setTargetZoom(INITIAL_ZOOM)
  }

  useEffect(() => {
    if (!highlightedCluster) {
      resetView()
      return
    }

    if (sourceNetwork) {
      // if sourceNetwork we move to its cluster centroid...
      const { centroid } = highlightedCluster
      const screenCoordsCentroid = [xScale(centroid[0]), yScale(centroid[1])]

      setTargetPosition(screenCoordsCentroid)
      setTargetZoom(15)
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

    const [x, y] = polygonCenter(matchingClustersCentroids)
    const targetCenterRescaled = [xScale(x), yScale(y)]

    setTargetPosition(targetCenterRescaled)
    setTargetZoom(15)

    // setTargetZoom(centroid)
  }, [highlightedClusterIndex])

  useFrame(() => {
    const z = ref.current.zoom
    const currentZoom = round(z)
    // const isAtTargetZoom = currentZoom === round(targetZoom)

    if (targetZoom) {
      ref.current.zoom = lerp(z, targetZoom, LERP_FACTOR)
      ref.current.updateProjectionMatrix()
    } else {
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

  function handleClusterClick(e) {
    function animateToRandomPoint() {
      const randZ = round(INITIAL_ZOOM + Math.random() * 100)
      setTargetZoom(randZ)

      const [randX, randY] = [
        round((Math.random() - 0.5) * 15),
        round((Math.random() - 0.5) * 15),
      ]
      setTargetPosition([randX, randY])
    }

    animateToRandomPoint()
  }

  return (
    <>
      <OrthographicCamera
        ref={ref}
        makeDefault
        position={[0, 0, 0]}
        zoom={INITIAL_ZOOM}
        up={[0, 0, 1]}
      />
      <MapControls
        enabled={false}
        // enableRotate={false}
        // enableZoom={true}
        // enableDamping
      />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <group ref={groupRef} position={[0, 0, 0]}>
        {dataset &&
          dataset.clusters.map((d, i) => (
            <Cluster
              key={i}
              data={d}
              scales={{ xScale, yScale }}
              cameraRef={ref}
              // onClick={handleClusterClick}
            />
          ))}
      </group>
    </>
  )
}

// Cluster

interface ClusterProps {
  key: number
  data: {
    cluster_id?: number
    nodes?: any[]
  }
  scales: {
    xScale: () => void
    yScale: () => void
  }
  cameraRef: MutableRefObject<OrthographicCameraProps>
  onClick?: (e: any) => void
}

const Cluster = ({ data, scales, cameraRef, onClick }: ClusterProps) => {
  const { xScale, yScale } = scales

  const pointRef = useRef(null)
  const bufferRef = useRef(null)

  const baseSize = 1
  const color = useMemo(() => randomColor(), [])

  const clusterId = data.cluster_id

  const subDataset = data.nodes
  const numPoints = subDataset.length

  const positions = useMemo(
    () => datasetCoordsToArrayOfPoints({ dataset: subDataset, xScale, yScale }),
    [subDataset, numPoints]
  )

  useFrame(({ clock }) => {
    //pointRef.current.size = lerp(pointRef.current.size, baseSize + cameraRef.current.zoom / 10, LERP_FACTOR)
    pointRef.current.size = baseSize + cameraRef.current.zoom / 20
    // // set material color
    // if (clusterId === 0) {
    //   pointRef.current.color = new Color(
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

  return (
    <group onClick={onClick}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            ref={bufferRef}
            attachObject={['attributes', 'position']}
            count={numPoints}
            itemSize={3}
            array={positions}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointRef}
          color={color}
          size={baseSize}
          /* sizeAttenuation={true} alphaTest={0.5} transparent={true} */
        />
      </points>
    </group>
  )
}

export default SingleNetwork
