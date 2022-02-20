import { useVizLayout } from '@/context/vizLayoutContext'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import * as Styled from './styled'

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
      <Styled.SidebarChapterSelectorWrapper ref={ref}>
        <Styled.SidebarChapterSelectorContent>
          <Styled.SidebarChapterSelectorCurrentChapterName onClick={open}>
            {chapters[layout.story.chapter].chapter_title}
          </Styled.SidebarChapterSelectorCurrentChapterName>
          <AnimatePresence>
            {isOpen && (
              <Styled.SidebarChapterSelectorChapterNameOptionsList
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
                  <Styled.SidebarChapterSelectorChapterNameOption
                    key={i}
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
                  </Styled.SidebarChapterSelectorChapterNameOption>
                ))}
              </Styled.SidebarChapterSelectorChapterNameOptionsList>
            )}
          </AnimatePresence>
        </Styled.SidebarChapterSelectorContent>
      </Styled.SidebarChapterSelectorWrapper>
    )
  )
}

export default SidebarChapterSelector
