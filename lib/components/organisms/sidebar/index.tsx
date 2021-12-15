import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import BlockContent from '@sanity/block-content-to-react'

import { useVizLayout } from '@/context/vizLayoutContext'
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

const Sidebar = () => {
  const [state, dispatch] = useVizLayout()
  const storyRef = useRef<HTMLDivElement>(null)
  const storyContentRef = useRef<HTMLDivElement>(null)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [blockIndex, setBlockIndex] = useState(0)

  const {
    story: { data },
  } = state

  const storyRefs = useMemo(
    () =>
      state.story.data.story_chapters.map(({ chapter_content }) => ({
        chapter: createRef(),
        blocks: chapter_content.map(() => createRef()),
      })),
    [chapterIndex, blockIndex]
  )

  //
  // initializing listeners

  const check = useCallback(
    (refs, { trigger, callback, accessor = (d) => d }) => {
      refs.map(accessor).map((ref, i) => {
        if (!ref.current) return

        const { y, height } = ref.current.getBoundingClientRect()

        if (trigger < y) return

        // console.log(i, ref.current)
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

  useEffect(() => {
    const fid = window.requestAnimationFrame(onScroll)
    return () => window.cancelAnimationFrame(fid)
  }, [chapterIndex, blockIndex])

  useEffect(() => {
    if (chapterIndex === null || blockIndex === null) return

    const clustersPayload = data.story_chapters[chapterIndex]
    const blockPayload = clustersPayload.chapter_content[blockIndex]

    dispatch({
      type: 'UPDATE_STORY_DATA',
      payload: {
        story: { chapter: chapterIndex, block: blockIndex },
        clusters: clustersPayload,
        block: blockPayload,
      },
    })
  }, [chapterIndex, blockIndex])

  return (
    <Styled.SidebarWrapper
      ref={storyRef}
      animate={{
        x: state.read ? 0 : '100%',
      }}
      transition={motionOptions}
    >
      <Styled.SidebarContent>
        <SidebarChapterSelector
          forwardRef={storyContentRef}
          storyRefs={storyRefs}
        />
        {data.story_chapters && (
          <Styled.SidebarStoryWrapper ref={storyContentRef}>
            <Styled.SidebarStoryContent>
              {data.story_chapters.map(
                ({ chapter_title, chapter_content }, i: number) => {
                  return (
                    <Styled.SidebarStoryChapterWrapper
                      key={i}
                      ref={storyRefs[i].chapter}
                    >
                      <Styled.SidebarStoryChapterTitle>
                        {chapter_title}
                      </Styled.SidebarStoryChapterTitle>
                      {chapter_content.map(
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
