import { useState } from 'react'
import { cajaAPI, movimientoAPI, productoAPI } from '../api/index.api'
import { useMemo } from 'react'
import { useEffect } from 'react'

export const useKardex = (token) => {
  const [movimientosRaw, setMovimientosRaw] = useState([])
  const [productos, setProductos] = useState([])
  const [cajas, setCajas] = useState([])

  // ESTADOS DE FILTRO SIMPLIFICADOS
  const [cajaId, setCajaId] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resProd, resMov, resCajas] = await Promise.all([
        productoAPI.listarProductos(token),
        movimientoAPI.listarTodos(token),
        cajaAPI.listarTodas(token),
      ])

      setProductos(resProd.data.productos || [])
      setMovimientosRaw(resMov.data.movimientos || [])
      setCajas(resCajas.data.cajas || [])
    } catch (error) {
      console.error('Error en Kardex:', error)
    } finally {
      setLoading(false)
    }
  }
  const dataProcesada = useMemo(() => {
    return movimientosRaw
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .map((m) => {
        let cantidadMov = 0
        if (m.categoria === 'Compra' && m.detalleCompra) {
          cantidadMov = parseFloat(m.detalleCompra.cantidad || 0)
        } else if (m.categoria === 'Venta' && m.detalleVenta) {
          cantidadMov = -parseFloat(m.detalleVenta.cantidad || 0)
        }

        return {
          ...m,
          cantidadMov,
          tipoInterfaz:
            m.categoria === 'Compra' || m.categoria === 'Venta' ? 'inventario' : 'gastos',
        }
      })
      .filter((m) => {
        const coincideCaja = cajaId === 'todas' ? true : m.CajaId === cajaId
        const coincideTipo = filtroTipo === 'todos' ? true : m.tipoInterfaz === filtroTipo
        return coincideCaja && coincideTipo
      })
  }, [movimientosRaw, cajaId, filtroTipo])

  useEffect(() => {
    fetchData()
  }, [])

  return {
    productos,
    cajas,
    cajaId,
    setCajaId,
    filtroTipo,
    setFiltroTipo,
    loading,
    dataProcesada,
  }
}
