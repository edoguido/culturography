import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import * as Styled from './styled'

const SidebarChapterSelector = ({ chapters, forwardRef, storyRefs }) => {
  const [open, setOpen] = useState(false)

  function close() {
    setOpen((prev) => !prev)
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

  const activeChtaperLabel = 'ciaone'

  return (
    chapters.length > 1 && (
      <Styled.SidebarChapterSelectorWrapper>
        <Styled.SidebarChapterSelectorContent>
          <Styled.SidebarChapterSelectorCurrentChapterName onClick={close}>
            {activeChtaperLabel}
          </Styled.SidebarChapterSelectorCurrentChapterName>
          <AnimatePresence>
            {open && (
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
