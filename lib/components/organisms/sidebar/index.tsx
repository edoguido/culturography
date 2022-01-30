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
import { motionOptions } from '@/const/motionProps'

import SidebarChapterSelector from 'components/molecules/sidebarChapterSelector'
import ChartSerializer from 'components/molecules/chartSerializer'
import * as Styled from './styled'

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
        blocks: blocks.map(() => createRef()),
      })),
    []
  )

  //

  const check = useCallback(
    (refs, { trigger, callback }) => {
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
          if (trigger > by && trigger < by + bh) {
            // we then check chapters coords
            if (trigger < cy) return
            // and proceed if we're in a chapter
            if (trigger > cy && trigger < cy + ch) {
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
            }
          }
        })
      })
    },
    [storyRefs]
  )

  const onScroll = useCallback(() => {
    window.requestAnimationFrame(onScroll)

    if (!storyRef.current) return

    const scrollTrigger = window.innerHeight / 2.5

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

  return (
    <Styled.SidebarWrapper
      ref={storyRef}
      animate={{
        x: layout.read ? 0 : '100%',
        // visibility: 'hidden',
      }}
      transition={motionOptions}
    >
      <Styled.SidebarContent>
        {layout.story && (
          <SidebarChapterSelector
            chapters={data.story_chapters}
            forwardRef={storyContentRef}
            storyRefs={storyRefs}
          />
        )}
        {data.story_chapters && (
          <Styled.SidebarStoryWrapper ref={storyContentRef}>
            <Styled.SidebarStoryContent>
              {data.story_chapters.map(
                ({ chapter_title, blocks }, i: number) => {
                  return (
                    <Styled.SidebarStoryChapterWrapper
                      key={i}
                      ref={storyRefs[i].chapter}
                    >
                      <Styled.SidebarStoryChapterTitle>
                        {chapter_title}
                      </Styled.SidebarStoryChapterTitle>
                      {blocks.map(
                        ({ block_title, block_content }, j: number) => {
                          const isHighlighted = j === storyState[1]
                          const highlightedClassName = isHighlighted
                            ? 'current'
                            : ''

                          return (
                            <Styled.SidebarStoryBlockWrapper
                              key={j}
                              ref={storyRefs[i].blocks[j]}
                              className={highlightedClassName}
                            >
                              {/* <Styled.SidebarStoryBlockTitle>
                                {block_title}
                              </Styled.SidebarStoryBlockTitle> */}
                              {block_content.map((c, t: number) => (
                                <Styled.SidebarStoryBlockContent key={t}>
                                  <BlockContent
                                    blocks={c}
                                    serializers={SERIALIZERS}
                                  />
                                </Styled.SidebarStoryBlockContent>
                              ))}
                            </Styled.SidebarStoryBlockWrapper>
                          )
                        }
                      )}
                    </Styled.SidebarStoryChapterWrapper>
                  )
                }
              )}
            </Styled.SidebarStoryContent>
          </Styled.SidebarStoryWrapper>
        )}
      </Styled.SidebarContent>
    </Styled.SidebarWrapper>
  )
}

export default Sidebar
