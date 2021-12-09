import styled from 'styled-components'

export const SidebarChapterSelectorChapterNameOption = styled.div`
  padding: 1rem;
`

export const SidebarChapterSelectorChapterNameOptionsList = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;

  background-color: burlywood;
`

export const SidebarChapterSelectorCurrentChapterName = styled.div`
  /* border: none; */
  height: var(--nav-height);
  padding: 1rem;
  width: 100%;
`

export const SidebarChapterSelectorContent = styled.div`
  width: 100%;

  ${SidebarChapterSelectorCurrentChapterName}, ${SidebarChapterSelectorChapterNameOption} {
    display: flex;
    align-items: center;
  }
`

export const SidebarChapterSelectorWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;

  background-color: white;
  display: flex;
  align-items: center;

  user-select: none;
  cursor: pointer;

  background-color: burlywood;

  font-size: 1.5rem;
`
