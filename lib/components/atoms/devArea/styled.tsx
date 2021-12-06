import styled from 'styled-components'

export const DevAreaContent = styled.div`
  pre {
    margin: 0;
  }
`

export const DevAreaWrapper = styled.div`
  z-index: 9999;

  position: fixed;
  bottom: 0;
  left: 0;
  height: 100%;
  background-color: black;
  color: white;

  opacity: 0.75;
  overflow-y: auto;

  width: 36rem;
  max-width: 100%;
  white-space: pre-wrap;
`

export default DevAreaWrapper
