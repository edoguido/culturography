import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Color, Vector3 } from 'three'
import { Html } from '@react-three/drei'
import { OrthographicCameraProps, useFrame } from '@react-three/fiber'
//
import { ClusterObjectProps } from '@/context/vizLayoutContext'
import { datasetCoordsToArrayOfPoints, lerp } from 'utils/math'
import {
  BASE_LABEL_SCALE,
  BASE_POINT_SIZE,
  LERP_FACTOR,
  MAX_ZOOM,
} from '@/const/visualization'

interface ClusterVisualizationProps {
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
}: ClusterVisualizationProps) => {
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
      labelRef.current.style.opacity = lerp(o, 1, 0.65)
    } else {
      labelRef.current.style.opacity = lerp(o, 0.1, 0.65)
    }
  })

  return (
    <group>
      {labelPosition && pointsRef.current && (
        <group position={labelPosition}>
          {/* {isDevelopment && <Box position={[0, 0, -20]} scale={1} />} */}
          <Html
            // as="div" // Wrapping element (default: 'div')
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
            <motion.h2
              ref={labelRef}
              className="text-3xl font-medium cursor-pointer select-none transition-opacity"
              onClick={onClick}
            >
              {data.name}
            </motion.h2>
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

export default Cluster
