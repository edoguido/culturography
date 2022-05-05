import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import BlockContent from '@sanity/block-content-to-react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion'

import { makeStoryPayload, useVizLayout } from '@/context/vizLayoutContext'

// import SidebarChapterSelector from 'components/molecules/sidebarChapterSelector'
import ChartSerializer from 'components/molecules/chartSerializer'

const handleBlockChange = (refs, { trigger, callback }) => {
  refs.forEach((ref, i) => {
    const chapterRef = ref.chapter.current

    if (!chapterRef) return

    const blockRefs = ref.blocks

    const { y: cy, height: ch } = chapterRef.getBoundingClientRect()

    blockRefs.forEach((bRef, j) => {
      const { y: by, height: bh } = bRef.current.getBoundingClientRect()

      // we first check blocks coords
      if (trigger < by) return
      // and proceed if we're in a block
      if (!(trigger > by && trigger < by + bh)) return
      // we then check chapters coords
      if (trigger < cy) return
      // and proceed if we're in a chapter
      if (!(trigger > cy && trigger < cy + ch)) return
      // we update layout
      callback((prev) => {
        const [pc, pb] = prev
        // if we're in the same chapter and block
        if (pc === i && pb === j) return prev
        // if we're in a new chapter but same block
        if (pc !== i && pb === j) return [i, pb]
        // if we're in the same chapter but new block
        if (pc === i && pb !== j) return [pc, j]
        // if we're in a new chapter and new block
        if (pc !== i && pb !== j) return [i, j]
      })
    })
  })
}

const SERIALIZERS = {
  types: {
    'story.chart': function storyChart(props) {
      return <ChartSerializer {...props} />
    },
  },
}

const Sidebar = ({ data }) => {
  const [layout, dispatch] = useVizLayout()
  //
  const [storyState, setStoryState] = useState<number[]>([0, 0])
  //
  const storyRef = useRef<HTMLDivElement>(null)
  const storyContentRef = useRef<HTMLDivElement>(null)
  const storyRefs = useMemo(
    () =>
      data.story_chapters.map(({ blocks }) => ({
        chapter: createRef(),
        blocks: blocks ? blocks.map(() => createRef()) : [],
      })),
    []
  )
  //
  const networksState = layout.networks
  const showSourceNetwork = networksState?.source.show
  const showTargetNetwork = networksState?.target.show
  //
  const sidebarShift =
    showSourceNetwork && showTargetNetwork
      ? '0%'
      : showSourceNetwork
      ? '30%'
      : showTargetNetwork
      ? '-30%'
      : '0%'
  //
  const check = useCallback(handleBlockChange, [storyRefs])

  const onScroll = useCallback(() => {
    window.requestAnimationFrame(onScroll)

    if (!storyRef.current) return

    const scrollTrigger = window.innerHeight / 1

    check(storyRefs, {
      trigger: scrollTrigger,
      callback: setStoryState,
    })
  }, [storyState])

  const updateStoryData = () => {
    if (storyState === null) return

    const [chapterIndex, blockIndex] = storyState

    dispatch({
      type: 'UPDATE_STORY_DATA',
      payload: makeStoryPayload({
        source: data,
        chapterIndex,
        blockIndex,
      }),
    })
  }

  //
  // check scroll on each frame
  useEffect(() => {
    const fid = window.requestAnimationFrame(onScroll)
    return () => window.cancelAnimationFrame(fid)
  }, [storyState])

  useEffect(() => updateStoryData(), [storyState])

  return (
    <div
      ref={storyRef}
      className="z-[100] fixed w-full top-0 bottom-0 max-h-screen"
    >
      {storyContentRef.current && (
        <ScrollProgress
          containerRef={storyContentRef}
          storyRefs={storyRefs}
          chapterIndex={storyState[1]}
        />
      )}
      <div className="h-full">
        {/* {layout.story && (
          <SidebarChapterSelector
            chapters={data.story_chapters}
            forwardRef={storyContentRef}
            storyRefs={storyRefs}
          />
        )} */}
        {data.story_chapters && (
          <div
            ref={storyContentRef}
            className="hide-scrollbar w-full max-h-full flex basis-auto flex-grow flex-shrink-0 overflow-x-hidden overflow-y-auto"
          >
            <motion.div
              className="relative h-full w-full mx-auto"
              initial={false}
              animate={{
                left: sidebarShift,
                transition: {
                  type: 'ease',
                  ease: [0.8, 0, 0, 1],
                  duration: 1.25,
                },
              }}
            >
              {data.story_chapters.map(
                ({ chapter_title, blocks }, i: number) => {
                  return (
                    <div key={i} ref={storyRefs[i].chapter}>
                      <div className="h-[calc(100vh-var(--nav-height)*1.5-0.5rem)] rounded-lg flex flex-col justify-end bg-gradient-to-b from-transparent to-accent mx-2">
                        <div className="mx-auto flex flex-col my-2 py-2">
                          <h2 className="text-text text-[6vw] inline-block rounded-full">
                            {chapter_title}
                          </h2>
                          <span className="text-text mx-auto my-2 py-2">
                            Scroll to continue
                          </span>
                        </div>
                      </div>

                      {blocks &&
                        blocks.map(
                          ({ /* block_title, */ block_content }, j: number) => {
                            const isHighlighted =
                              i === storyState[0] && j === storyState[1]

                            const highlightedClassName = isHighlighted
                              ? 'current'
                              : ''

                            return (
                              <div
                                key={j}
                                ref={storyRefs[i].blocks[j]}
                                className={`h-[200vh] max-w-[var(--sidebar-width)] mx-auto ${highlightedClassName}`}
                              >
                                {block_content && (
                                  <div className="p-3 rounded-lg bg-opacity-50 bg-black backdrop-blur-lg">
                                    {/* <h2>
                                {block_title}
                              </h2> */}
                                    {block_content.map((c, t: number) => (
                                      <div key={t} className="rich-text">
                                        <BlockContent
                                          blocks={c}
                                          serializers={SERIALIZERS}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          }
                        )}
                    </div>
                  )
                }
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

const ScrollProgress = ({ containerRef, chapterIndex, storyRefs }) => {
  const scrollHeight =
    containerRef.current.children[0].getBoundingClientRect().height
  //
  const scrollProgress = useMotionValue(0)
  const scrollTransform = useTransform(
    scrollProgress,
    [0, scrollHeight],
    [100, 0]
  )
  const scrollRailWidth = useMotionTemplate`${scrollTransform}%`

  function checkProgress() {
    window.requestAnimationFrame(checkProgress)

    if (!containerRef.current) return

    const currentScroll = scrollProgress.get()
    const scrollTop = containerRef.current.scrollTop
    const screenHeight = window.innerHeight
    const normalizedScroll = currentScroll / scrollHeight

    scrollProgress.set(scrollTop + screenHeight * normalizedScroll)

    // console.log(containerRef.current.scrollTop)
  }

  useEffect(() => {
    const f = window.requestAnimationFrame(checkProgress)
    return () => window.cancelAnimationFrame(f)
  }, [])

  return (
    containerRef && (
      <div className="relative mt-[var(--nav-height)] w-full h-[calc(var(--nav-height)/2)]">
        <div className="rail absolute bg-gray-400 top-1/2 left-0 right-0 mx-2 h-0.5 rounded-full" />
        <motion.div
          className="scroll-progress absolute bg-accent top-1/2 left-0 right-0 mx-2 h-0.5 rounded-full"
          style={{ right: scrollRailWidth }}
        />
        {/* <div className="absolute inset-0 top-1/2 mx-2 flex">
          {storyRefs.map(({ blocks }) => (
            <div className="w-full flex">
              {blocks.map((_, i) => {
                const isPassed = i < chapterIndex ? 'bg-accent' : 'bg-gray-400'

                return (
                  <div className="w-full flex justify-center">
                    <div
                      className={`w-2 h-2 rounded-full ${isPassed} -translate-y-1`}
                      style={
                        {
                          // left: `${(i * 100) / blocks.length}%`,
                        }
                      }
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div> */}
      </div>
    )
  )
}

export default Sidebar
