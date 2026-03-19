export const formatFecha = (fechaISO) => {
  if (!fechaISO) return '---'
  const date = new Date(fechaISO)
  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}
export const formatMoney = (valor) => {
  const numero = parseFloat(valor) || 0
  return numero.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
