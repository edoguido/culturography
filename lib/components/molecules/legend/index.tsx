import { useVizLayout } from '@/context/vizLayoutContext'

const labels = [
  'No overlap',
  'Very weak overlap',
  'Weak overlap',
  'Strong overlap',
  'Very strong overlap',
]

const Legend = () => {
  const [layout] = useVizLayout()

  const legend = layout?.networks?.legend

  return (
    legend && (
      <div className="absolute z-10 right-0 top-0 text-white bg-[#ffffff30] p-2">
        <div>Overlap</div>
        {legend.map((color, i) => {
          return (
            <span key={i} className="text-sm">
              {labels[i]}
            </span>
          )
        })}
      </div>
    )
  )
}

export default Legend
