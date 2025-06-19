export function formatPhoneNumber(number) {
  if (!number) return ''
  const cleaned = number.toString().replace(/\D/g, '').slice(0, 10)
  if (cleaned.length <= 3) return `(${cleaned}`
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)})-${cleaned.slice(3)}`
  return `(${cleaned.slice(0, 3)})-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}
