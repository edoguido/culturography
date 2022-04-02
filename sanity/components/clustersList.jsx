import React from 'react'
import { Card, Stack, Select } from '@sanity/ui'
import { FormField } from '@sanity/base/components'
import PatchEvent, { set, unset } from '@sanity/form-builder/PatchEvent'
import { withDocument } from 'part:@sanity/form-builder'
import { useId } from '@reach/auto-id'

const accessorKey = 'network_metadata'

function groupByNetwork(data) {
  const relevantClusters = data.filter((c) =>
    c.centroid ? c.centroid.length > 0 : c.pca_centroid.length > 0
  )
  const networkNames = relevantClusters.map((c) => c.network)
  const uniqueNames = [...new Set(networkNames)]

  return uniqueNames.map((l) => [
    l,
    relevantClusters.filter((d) => d.network === l),
  ])
}

const ClustersList = React.forwardRef((props, ref) => {
  const {
    document,
    type, // Schema information
    value, // Current field value
    readOnly, // Boolean if field is not editable
    markers, // Markers including validation rules
    presence, // Presence information for collaborative avatars
    compareValue, // Value to check for "edited" functionality
    onFocus, // Method to handle focus state
    onBlur, // Method to handle blur state
    onChange, // Method to handle patch events,
  } = props

  const [listItems, setListItems] = React.useState([])
  const inputId = useId()

  const handleChange = React.useCallback(
    // useCallback will help with performance
    (event) => {
      const inputValue = event.currentTarget.value // get current value
      // if the value exists, set the data, if not, unset the data
      onChange(PatchEvent.from(inputValue ? set(inputValue) : unset()))
    },
    [onChange]
  )

  React.useEffect(() => {
    async function getNetworkData() {
      const fileReference = document[accessorKey].asset._ref
      const [elementType, id, kind] = fileReference.split('-')

      const jsonData = await fetch(
        `https://cdn.sanity.io/files/xmrgv8k7/production/${id}.${kind}`
      ).then((r) => r.json())

      return groupByNetwork(jsonData)
    }

    getNetworkData()
      .then((data) => setListItems(data))
      .catch((e) => {
        console.error(e)
        setListItems(null)
      })
  }, [])

  return (
    <FormField
      description={type.description} // Creates description from schema
      title={type.title} // Creates label from schema title
      __unstable_markers={markers} // Handles all markers including validation
      __unstable_presence={presence} // Handles presence avatars
      compareValue={compareValue} // Handles "edited" status
      inputId={inputId} // Allows the label to connect to the input field
    >
      <Card padding={0}>
        <Stack>
          <Select
            id={inputId} // A unique ID for this input
            fontSize={2}
            padding={[3, 3, 4]}
            space={[3, 3, 4]}
            value={value} // Current field value
            readOnly={readOnly} // If "readOnly" is defined make this field read only
            onFocus={onFocus} // Handles focus events
            onBlur={onBlur} // Handles blur events
            ref={ref}
            onChange={handleChange} // A function to call when the input value changes
          >
            <option value={'null'}>None</option>
            {listItems &&
              listItems?.map(([networkName, data]) =>
                data.length === 1 ? (
                  data.map(({ cluster_id, name }) => (
                    <option key={name} value={cluster_id}>
                      {networkName}
                    </option>
                  ))
                ) : (
                  <>
                    <option disabled>{networkName}</option>
                    {data.map(({ cluster_id, name }) => (
                      <option key={name} value={cluster_id}>
                        {name}
                      </option>
                    ))}
                  </>
                )
              )}
          </Select>
        </Stack>
      </Card>
    </FormField>
  )
})

export default withDocument(ClustersList)
