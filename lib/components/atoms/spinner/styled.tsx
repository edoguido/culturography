import styled, { keyframes } from 'styled-components'
import { getColor } from 'utils/theme'

const spinAnimation = keyframes`
 0% { transform: rotate(0deg) }
 100% { transform: rotate(360deg) }
`

export const SpinnerWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 999;
  background-color: ${getColor('palette:black')};

  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 32px;
    height: 32px;
    animation-name: ${spinAnimation};
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }
`

export default SpinnerWrapper
