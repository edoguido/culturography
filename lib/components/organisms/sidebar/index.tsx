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

const SERIALIZERS = {
  types: {
    'story.chart': () => <p>A chart here!</p>,
  },
}

const Sidebar = () => {
  const [state, dispatch] = useVizLayout()
  const storyRef = useRef<HTMLDivElement>(null)
  const [chapterIndex, setChapterIndex] = useState(null)
  const [blockIndex, setBlockIndex] = useState(null)

  const {
    story: { data },
  } = state

  const chapterRefs = useMemo(
    () => state.story.data.story_chapters.map(() => createRef()),
    []
  )

  const blockRefs = useMemo(() => {
    const refs = []

    state.story.data.story_chapters.map(({ chapter_content }) =>
      chapter_content.map(() => refs.push(createRef()))
    )

    return refs
  }, [])

  const checkChapters = useCallback(
    (scrollTop) => {
      chapterRefs.map((ref, i) => {
        if (!ref.current) return

        const refTop = ref.current.offsetTop
        const refBottom = refTop + ref.current.offsetHeight

        if (scrollTop > refTop && scrollTop < refBottom) {
          setChapterIndex((prev) => (prev === i ? prev : i))
          return
        }
      })
    },
    [chapterIndex]
  )

  const checkBlocks = useCallback(
    (scrollTop) => {
      blockRefs.map((ref, i) => {
        if (!ref.current) return

        const refTop = ref.current.offsetTop
        const refBottom = refTop + ref.current.offsetHeight

        if (scrollTop > refTop && scrollTop < refBottom) {
          setBlockIndex((prev) => (prev === i ? prev : i))
          return
        }
      })
    },
    [blockIndex]
  )

  const onScroll = useCallback(() => {
    window.requestAnimationFrame(onScroll)

    if (!storyRef.current) return

    const scrollTop = storyRef.current.scrollTop

    checkChapters(scrollTop)
    checkBlocks(scrollTop)
  }, [chapterIndex, blockIndex])

  useEffect(() => {
    const fid = window.requestAnimationFrame(onScroll)
    return () => window.cancelAnimationFrame(fid)
  }, [chapterIndex, blockIndex])

  useEffect(() => {
    if (chapterIndex === null) return

    // console.log('changing chapter', chapterIndex)

    const { left_network_shapefile, right_network_shapefile } =
      data.story_chapters[chapterIndex]

    dispatch({
      type: 'UPDATE_STORY_CHAPTER',
      payload: {
        story: { chapter: chapterIndex },
        clusters: {
          left: { shapefile: left_network_shapefile, zoom: null },
          right: { shapefile: right_network_shapefile, zoom: null },
        },
      },
    })
  }, [chapterIndex])

  useEffect(() => {
    if (blockIndex === null) return

    // console.log('changing to block', blockIndex)

    let dispatchActionPayload = {
      story: { block: blockIndex },
      clusters: {
        highlight: { type: null, id: null },
        left: null,
        right: null,
      },
    }

    const { highlight, network_control } =
      data.story_chapters[chapterIndex].chapter_content[blockIndex]

    // **                      ** //
    // PLEASE REFACTOR THIS SHIT  //
    // **                     ** //

    dispatchActionPayload.story = { block: blockIndex }

    if (network_control) {
      dispatchActionPayload.clusters.left = {
        zoom: network_control.left_cluster_zoom,
      }

      dispatchActionPayload.clusters.right = {
        zoom: network_control.right_cluster_zoom,
      }
    }

    if (highlight) {
      dispatchActionPayload.clusters.highlight = {
        type: 'cluster',
        id: highlight,
      }
    }

    dispatch({
      type: 'UPDATE_STORY_BLOCK',
      payload: dispatchActionPayload,
    })
  }, [blockIndex])

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
                      ({ block_title, block_content }, j: number) => {
                        return (
                          <Styled.SidebarStoryBlockWrapper
                            key={j}
                            ref={blockRefs[j]}
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
