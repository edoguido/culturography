import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import BlockContent from '@sanity/block-content-to-react'

import { makeStoryPayload, useVizLayout } from '@/context/vizLayoutContext'

// import SidebarChapterSelector from 'components/molecules/sidebarChapterSelector'
import ChartSerializer from 'components/molecules/chartSerializer'
import { motion } from 'framer-motion'

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

  //
  // check scroll on each frame
  useEffect(() => {
    const fid = window.requestAnimationFrame(onScroll)
    return () => window.cancelAnimationFrame(fid)
  }, [storyState])

  useEffect(() => {
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
  }, [storyState])

  const networksState = layout.networks
  const showSourceNetwork = networksState?.source.show
  const showTargetNetwork = networksState?.target.show

  const sidebarShift =
    showSourceNetwork && showTargetNetwork
      ? '0%'
      : showSourceNetwork
      ? '25%'
      : showTargetNetwork
      ? '-25%'
      : '50%'

  return (
    <div
      ref={storyRef}
      className="z-[100] fixed top-[var(--nav-height)] w-full bottom-0 max-h-screen"
    >
      <div className="h-full">
        {/* {layout.story && (
          <SidebarChapterSelector
            chapters={data.story_chapters}
            forwardRef={storyContentRef}
            storyRefs={storyRefs}
          />
        )} */}
        {data.story_chapters && networksState && (
          <div
            ref={storyContentRef}
            className="hide-scrollbar w-full max-h-full flex basis-auto flex-grow flex-shrink-0 overflow-x-hidden overflow-y-auto"
          >
            <motion.div
              className="relative h-full max-w-[var(--sidebar-width)] mx-auto p-2 pb-[calc(70vh-var(--nav-height))]"
              initial={false}
              animate={{
                x: '0%',
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
                      <h2 className="text-accent font-normal text-3xl inline-block rounded-full py-1 px-3">
                        {chapter_title}
                      </h2>
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
                                className={`my-2 h-[200vh] ${highlightedClassName}`}
                              >
                                {block_content && (
                                  <div className="p-3 rounded-lg bg-[#111111]">
                                    {/* <h2>
                                {block_title}
                              </h2> */}
                                    {block_content.map((c, t: number) => (
                                      <div key={t} className="rich-text hwul">
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

export default Sidebar
