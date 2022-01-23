// Round number
export function round(value, positions = 1000) {
  return Math.round(value * positions) / positions
}

// Linear Interpolation
export function lerp(start, end, t) {
  return start * (1 - t) + end * t
}

// Generate random color
export const randomColor = () =>
  `rgb(${Math.round(Math.random() * 255)},${Math.round(
    Math.random() * 255
  )},${Math.round(Math.random() * 255)})`

export function convertDatasetCoordsToPoints({ dataset, xScale, yScale }) {
  const out = new Float32Array(dataset.length * 3)

  let acc = 0
  for (let i = 0; i < out.length; i++) {
    if (i % 3 === 0) {
      out[i] = xScale(dataset[acc].x)
    }

    if (i % 3 === 1) {
      out[i] = yScale(dataset[acc].y)
    }

    if (i % 3 === 2) {
      out[i] = -1
      acc++
    }
  }

  return out
}
