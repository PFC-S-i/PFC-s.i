/* eslint-disable @typescript-eslint/no-explicit-any */

const FormatSelectOptions = (arr?: any[]) => {
  if (!arr) return []
  return arr?.map((item) => ({
    label: item.name,
    value: item.id,
  }))
}

export { FormatSelectOptions }
