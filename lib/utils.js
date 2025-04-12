export function formatCurrency(value) {
  if (!value) return "$0"

  // If value is already formatted with $ and commas, return it
  if (typeof value === "string" && value.startsWith("$")) {
    return value
  }

  // Convert to number if it's a string
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  // Format the number as currency
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numValue)
}
