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
import * as Styled from './styled'

const Sidebar = () => {
  const [state, dispatch] = useVizLayout()
  const storyRef = useRef<HTMLDivElement>(null)
  const [chapterIndex, setChapterIndex] = useState(null)

  const {
    story: { data },
  } = state

  const chapterRefs = useMemo(
    () => state.story.data.story_chapters.map(() => createRef()),
    []
  )

  const onScroll = useCallback(() => {
    window.requestAnimationFrame(onScroll)

    const checkChapters = (scrollTop) => {
      chapterRefs.map((ref, i) => {
        if (!ref.current) return

        const refTop = ref.current.scrollTop
        const refBottom = refTop + ref.current.scrollHeight

        if (scrollTop > refTop && scrollTop < refBottom) {
          setChapterIndex(i)
          return
        }
      })
    }

    if (!storyRef.current) return

    const scrollTop = storyRef.current.scrollTop

    checkChapters(scrollTop)
  }, [chapterRefs])

  useEffect(() => {
    window.requestAnimationFrame(onScroll)
  }, [])

  useEffect(() => {
    if (chapterIndex === null) return

    const { left_network_shapefile, right_network_shapefile } =
      data.story_chapters[chapterIndex]

    dispatch({
      type: 'UPDATE_STORY_CHAPTER',
      payload: {
        story: { chapter: chapterIndex },
        clusters: {
          left: left_network_shapefile,
          right: right_network_shapefile,
        },
      },
    })
  }, [chapterIndex])

  return (
    <Styled.SidebarWrapper
      ref={storyRef}
      animate={{
        x: state.read ? 0 : state.sidebarWidth.value,
      }}
      transition={motionOptions}
    >
      <Styled.SidebarContent>
        <SidebarChapterSelector />
        {data.story_chapters && (
          <Styled.SidebarStoryContent>
            {data.story_chapters.map(
              ({ chapter_title, chapter_content }, i: number) => {
                return (
                  <Styled.SidebarStoryChapterWrapper
                    key={i}
                    ref={chapterRefs[i]}
                  >
                    <Styled.SidebarStoryChapterTitle>
                      {chapter_title}
                    </Styled.SidebarStoryChapterTitle>
                    {chapter_content.map(
                      (
                        { block_title, block_content, ref: chapterContentRef },
                        j: number
                      ) => {
                        return (
                          <Styled.SidebarStoryBlockWrapper key={j}>
                            <Styled.SidebarStoryBlockTitle>
                              {block_title}
                            </Styled.SidebarStoryBlockTitle>
                            {block_content.map((c, t: number) => (
                              <Styled.SidebarStoryBlockContent
                                key={t}
                                ref={chapterContentRef}
                              >
                                <BlockContent blocks={c} />
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
        )}
      </Styled.SidebarContent>
    </Styled.SidebarWrapper>
  )
}

const StoryChapter = () => {
  const chapterRef = useRef()

  return
}

export default Sidebar
