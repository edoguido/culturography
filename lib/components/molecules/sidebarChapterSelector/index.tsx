import { useVizLayout } from '@/context/vizLayoutContext'
import { useEffect, useState } from 'react'
import * as Styled from './styled'

const SidebarChapterSelector = () => {
  const [state, dispatch] = useVizLayout()
  const [open, setOpen] = useState(false)

  // const {
  //   story: {
  //     data: { story_chapters },
  //   },
  // } = state

  function handleClick() {
    setOpen((prev) => !prev)
  }

  useEffect(() => {
    dispatch({
      type: 'UPDATE_CHAPTER',
    })
  }, [])

  return (
    <Styled.SidebarChapterSelectorWrapper>
      <Styled.SidebarChapterSelectorContent>
        <Styled.SidebarChapterSelectorCurrentChapterName onClick={handleClick}>
          ChapterName
        </Styled.SidebarChapterSelectorCurrentChapterName>
        {open && (
          <Styled.SidebarChapterSelectorChapterNameOptionsList>
            <Styled.SidebarChapterSelectorChapterNameOption value="ChapterName">
              ChapterName
            </Styled.SidebarChapterSelectorChapterNameOption>
          </Styled.SidebarChapterSelectorChapterNameOptionsList>
        )}
      </Styled.SidebarChapterSelectorContent>
    </Styled.SidebarChapterSelectorWrapper>
  )
}

export default SidebarChapterSelector
