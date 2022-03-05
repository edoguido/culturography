import { useVizLayout } from '@/context/vizLayoutContext'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const SidebarChapterSelector = ({ chapters, forwardRef, storyRefs }) => {
  const [layout] = useVizLayout()
  const [isOpen, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  function open() {
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  function handleClick(index) {
    const chapterTitleOffsetTop = storyRefs[index].chapter.current.offsetTop

    forwardRef.current.scrollTo({
      top: chapterTitleOffsetTop,
      left: 0,
      behavior: 'smooth',
    })

    close()
  }

  useEffect(() => {
    function checkOutsideClick(e) {
      const clickedInside = ref.current.contains(e.target)

      if (clickedInside) open()
      else close()
    }

    window.addEventListener('pointerup', checkOutsideClick)
    return () => window.removeEventListener('pointerup', checkOutsideClick)
  }, [ref.current])

  return (
    chapters.length > 1 && (
      <div
        ref={ref}
        className="z-10 flex items-center select-none cursor-pointer text-2xl"
      >
        <div className="relative w-full">
          <div
            className="h-[var(--nav-height)] p-4 z-[101] text-ellipsis overflow-hidden whitespace-nowrap bg-orange-500"
            onClick={open}
          >
            {chapters[layout.story.chapter].chapter_title}
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute z-[100] overflow-hidden bg-black top-0 right-0 left-0"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={{
                  initial: {
                    opacity: 0,
                    height: 0,
                    transformOrigin: 'top center',
                  },
                  animate: {
                    opacity: 1,
                    height: 'auto',
                    transformOrigin: 'top center',
                  },
                  exit: {
                    opacity: 0,
                    height: 0,
                    transformOrigin: 'top center',
                    pointerEvents: 'none',
                  },
                }}
                transition={{
                  staggerChildren: 0.05,
                  default: {
                    type: 'spring',
                    stiffness: 1000,
                    damping: 100,
                  },
                }}
              >
                {chapters.map((sc, i) => (
                  <motion.div
                    key={i}
                    className="p-4"
                    onClick={() => handleClick(i)}
                    custom={i}
                    variants={{
                      initial: (i) => ({
                        transformOrigin: 'center left',
                        y: `${(i + 1) * -40}%`,
                        rotate: -10,
                      }),
                      animate: () => ({
                        y: `0%`,
                        rotate: 0,
                      }),
                      exit: (i) => ({
                        transformOrigin: 'center right',
                        y: `${(i + 1) * -40}%`,
                        rotate: 6,
                      }),
                    }}
                  >
                    {sc.chapter_title}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  )
}

export default SidebarChapterSelector
