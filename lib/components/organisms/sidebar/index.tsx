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
  const [state, dispatch] = useVizLayout()
  const storyRef = useRef<HTMLDivElement>(null)
  const storyContentRef = useRef<HTMLDivElement>(null)
  const [chapterIndex, setChapterIndex] = useState<number>(0)
  const [blockIndex, setBlockIndex] = useState<number>(0)

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
    (refs, { trigger, callback, accessor = (d) => d }) => {
      refs.map(accessor).map((ref, i) => {
        if (!ref.current) return

        const { y, height } = ref.current.getBoundingClientRect()

        if (trigger < y) return

        if (trigger > y && trigger < y + height) {
          callback((prev) => {
            return prev === i ? prev : i
          })
          return
        }
      })
    },
    [storyRefs]
  )

  const onScroll = useCallback(() => {
    window.requestAnimationFrame(onScroll)

    if (!storyRef.current) return

    const scrollTrigger = window.innerHeight / 2

    check(storyRefs, {
      trigger: scrollTrigger,
      callback: setChapterIndex,
      accessor: (d) => d.chapter,
    })

    check(storyRefs[chapterIndex].blocks, {
      trigger: scrollTrigger,
      callback: setBlockIndex,
    })
  }, [chapterIndex, blockIndex])

  //
  // check scroll on each frame
  useEffect(() => {
    const fid = window.requestAnimationFrame(onScroll)
    return () => window.cancelAnimationFrame(fid)
  }, [chapterIndex, blockIndex])

  useEffect(() => {
    if (chapterIndex === null || blockIndex === null) return

    dispatch({
      type: 'UPDATE_STORY_DATA',
      payload: makeStoryPayload({
        source: data,
        chapterIndex,
        blockIndex,
      }),
    })
  }, [chapterIndex, blockIndex])

  return (
    <Styled.SidebarWrapper
      ref={storyRef}
      animate={{
        x: state.read ? 0 : '100%',
        // visibility: 'hidden',
      }}
      transition={motionOptions}
    >
      <Styled.SidebarContent>
        <SidebarChapterSelector
          chapters={data.story_chapters}
          forwardRef={storyContentRef}
          storyRefs={storyRefs}
        />
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
                          return (
                            <Styled.SidebarStoryBlockWrapper
                              key={j}
                              ref={storyRefs[i].blocks[j]}
                            >
                              <Styled.SidebarStoryBlockTitle>
                                {block_title}
                              </Styled.SidebarStoryBlockTitle>
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
