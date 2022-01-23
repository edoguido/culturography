import {
  MutableRefObject,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, OrthographicCameraProps, useFrame } from '@react-three/fiber'
import { OrthographicCamera, MapControls } from '@react-three/drei'
import * as d3 from 'd3'

import { useVizLayout } from '@/context/vizLayoutContext'
// import { apiFetch } from 'utils/cms'

import {
  round,
  lerp,
  randomColor,
  convertDatasetCoordsToPoints,
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

const SingleNetwork = ({ data, accessor }) => {
  const [layout] = useVizLayout()
  const [fetching, setFetching] = useState(true)
  //
  const [dataset, setDataset] = useState(null)
  //
  const wrapperRef = useRef(null)
  //
  const accessorKey = `${accessor}_network_shapefile`
  //
  // **
  // runtime

  const fetchNetwork = async () => {
    const { asset } = data.networks[accessorKey]

    const options = { headers: { accepts: 'application/json' } }
    const dataset = await fetch(`https://api.sanity.io/${asset.path}`, options)
      .then((r) => r.json())
      .catch(console.error)

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
      <Canvas>{dataset && <Scene dataset={dataset} />}</Canvas>
    </div>
  )
}

const Scene = ({ dataset }) => {
  const ref = useRef(null)
  const groupRef = useRef(null)

  const [targetZoom, setTargetZoom] = useState(INITIAL_ZOOM)
  const [targetPosition, setTargetPosition] = useState([0, 0])

  // scales
  const xScale = d3.scaleLinear().domain(dataset.extent.x).range([-50, 50])
  const yScale = d3.scaleLinear().domain(dataset.extent.y).range([-50, 50])

  useFrame(() => {
    const z = ref.current.zoom
    const currentZoom = round(z)
    // const isAtTargetZoom = currentZoom === round(targetZoom)

    if (targetZoom) {
      ref.current.zoom = lerp(z, targetZoom, 0.1)
      ref.current.updateProjectionMatrix()
    } else {
      setTargetZoom(null)
    }

    const [x, y] = [groupRef.current.position.x, groupRef.current.position.y]
    const isAtTargetPosition =
      round(x) === targetPosition[0] && round(y) === targetPosition[1]
    if (!isAtTargetPosition) {
      groupRef.current.position.x = lerp(x, targetPosition[0], 0.1)
      groupRef.current.position.y = lerp(y, targetPosition[1], 0.1)
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
              cameraRef={ref}
              data={d}
              onClick={handleClusterClick}
              scales={{ xScale, yScale }}
            />
          ))}
      </group>
    </>
  )
}

// Cluster

interface ClusterProps {
  data: {
    cluster_id: number
    nodes: any[]
  }
  scales: {
    xScale: () => void
    yScale: () => void
  }
  onClick: (e: any) => void
  cameraRef: MutableRefObject<OrthographicCameraProps>
}

const Cluster = ({ data, scales, onClick, cameraRef }: ClusterProps) => {
  const { xScale, yScale } = scales

  const pointRef = useRef(null)
  const bufferRef = useRef(null)

  const baseSize = 1
  const color = useMemo(() => randomColor(), [])

  const clusterId = data.cluster_id
  const subDataset = data.nodes
  const numPoints = subDataset.length

  const positions = useMemo(
    () => convertDatasetCoordsToPoints({ dataset: subDataset, xScale, yScale }),
    [subDataset, numPoints]
  )

  useFrame(({ clock }) => {
    //pointRef.current.size = lerp(pointRef.current.size, baseSize + cameraRef.current.zoom / 10, 0.1)
    pointRef.current.size = baseSize + cameraRef.current.zoom / 20
    // set material color
    // pointRef.current.color = new Color(Math.sin(clock.getElapsedTime()), Math.sin(clock.getElapsedTime()), Math.cos(clock.getElapsedTime()))
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
