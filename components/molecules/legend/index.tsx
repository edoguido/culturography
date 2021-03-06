import { useVizLayout } from '@/context/vizLayoutContext'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'

const labels = ['None', 'Very weak', 'Weak', 'Medium', 'Strong', 'Very strong']

const Legend = () => {
  const [layout] = useVizLayout()

  const legend = layout?.networks?.legend

  const isHighlighting = useMemo(() => {
    if (layout?.networks?.nameHighlight === undefined) return undefined
    return JSON.parse(layout?.networks?.nameHighlight)
  }, [legend])

  return (
    <AnimatePresence>
      {isHighlighting && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: {
              y: 20,
              opacity: 0,
            },
            animate: {
              y: 0,
              opacity: 1,
            },
            exit: {
              y: 20,
              opacity: 0,
            },
          }}
          transition={{
            type: 'ease',
            ease: [0, 0, 0, 1],
          }}
          className="absolute z-10 right-0 bottom-0 origin-bottom-right text-white bg-white bg-opacity-10 rounded-tl-lg p-4"
        >
          <div>Overlap</div>
          <div className="flex mt-2">
            {legend &&
              legend.map((color, i) => {
                return (
                  <div key={i} className="w-20 mr-2 last:mr-0 flex flex-col">
                    <div
                      className="w-full h-4 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span key={i} className="mt-2 text-xs">
                      {labels[i]}
                    </span>
                  </div>
                )
              })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Legend
