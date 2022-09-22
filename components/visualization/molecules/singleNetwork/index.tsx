import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { useContextBridge } from '@react-three/drei'
import * as d3 from 'd3'
//
import {
  ClusterObjectProps,
  useVizLayout,
  VizLayoutContext,
} from '@/context/vizLayoutContext'
import Spinner from 'components/visualization/atoms/spinner'
import { hideUiControls } from 'utils/index'
import { groupDatapointsByCluster, rankedClusters } from 'utils/data'
import { DatasetProps, NetworkName } from '@/types/visualization'

const Scene = dynamic(
  () => import('components/visualization/molecules/scene'),
  { ssr: false }
)

interface SingleNetwork {
  data: object[]
  activeCluster: ClusterObjectProps
  accessor: NetworkName
}

// components

const SingleNetwork = ({ accessor, data, activeCluster }) => {
  const [layout] = useVizLayout()

  const ContextBridge = useContextBridge(VizLayoutContext)
  //
  const [fetching, setFetching] = useState<boolean>(true)
  const [dataset, setDataset] = useState<DatasetProps>(null)
  //
  const canvasRef = useRef<HTMLCanvasElement>(null)
  //
  const accessorKey: string = `${accessor}_network_shapefile`
  const networkName: string = data[`${accessor}_network_name`]
  const networkID: string = data[`${accessor}_network_id`].toUpperCase()

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

    const { asset }: { asset: { url: string; path: string } } =
      data[accessorKey]

    const dataset = await fetch(asset.url).then((r) => r.json())
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
      <NetworkLabel
        label={`${networkName} - ${networkID}`}
        isSource={isSourceNetwork}
      />
      <Cursor />
      <Canvas ref={canvasRef}>
        <ContextBridge>
          {!fetching && dataset && (
            <Scene
              dataset={dataset}
              networkName={accessor}
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

const NetworkLabel = ({
  label,
  isSource,
}: {
  label: string
  isSource: boolean
}) => {
  const positioning = isSource ? 'rounded-br-2xl' : 'right-0 rounded-bl-2xl'

  return (
    <motion.h3
      className={`absolute ${positioning} z-30 bg-white bg-opacity-10 text-xl tracking-wider py-1 px-3`}
    >
      {label}
    </motion.h3>
  )
}

const Cursor = () => {
  return (
    !hideUiControls && (
      <div className="absolute z-20 top-1/2 left-1/2 text-red-500 -translate-x-1/2 -translate-y-1/2">
        +
      </div>
    )
  )
}

export default SingleNetwork
