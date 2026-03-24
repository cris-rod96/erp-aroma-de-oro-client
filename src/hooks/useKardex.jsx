import { useState, useMemo, useEffect } from 'react'
import { cajaAPI, movimientoAPI, productoAPI } from '../api/index.api'

export const useKardex = (token) => {
  const [movimientosRaw, setMovimientosRaw] = useState([])
  const [productos, setProductos] = useState([])
  const [cajas, setCajas] = useState([])

  const [cajaId, setCajaId] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroTiempo, setFiltroTiempo] = useState('todos')
  const [loading, setLoading] = useState(true)

  // --- LÓGICA DE INTERDEPENDENCIA DE FILTROS ---
  useEffect(() => {
    // Si el usuario elige un rango de tiempo amplio, forzamos "Todas las Cajas"
    // Porque una caja específica es una entidad diaria.
    if (filtroTiempo !== 'todos' && filtroTiempo !== 'dia') {
      if (cajaId !== 'todas') {
        setCajaId('todas')
      }
    }
  }, [filtroTiempo])

  useEffect(() => {
    // Si selecciona una caja específica, el tiempo debe ser "Todos" o "Día"
    // para no filtrar erróneamente movimientos de esa caja en otros rangos.
    if (cajaId !== 'todas') {
      if (filtroTiempo !== 'todos' && filtroTiempo !== 'dia') {
        setFiltroTiempo('todos')
      }
    }
  }, [cajaId])
  // ----------------------------------------------

  const fetchData = async () => {
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
    const ahora = new Date()

    return movimientosRaw
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .map((m) => {
        return {
          ...m,
          fechaObj: new Date(m.fecha),
          tipoInterfaz:
            m.categoria === 'Compra' || m.categoria === 'Venta' ? 'inventario' : 'gastos',
        }
      })
      .filter((m) => {
        // 1. Filtro de Caja
        const coincideCaja = cajaId === 'todas' ? true : m.CajaId === cajaId

        // 2. Filtro de Tipo
        const coincideTipo = filtroTipo === 'todos' ? true : m.tipoInterfaz === filtroTipo

        // 3. Filtro de Tiempo
        let coincideTiempo = true
        const mFecha = m.fechaObj

        if (filtroTiempo === 'dia') {
          coincideTiempo = mFecha.toDateString() === ahora.toDateString()
        } else if (filtroTiempo === 'semana') {
          const unaSemanaAtras = new Date()
          unaSemanaAtras.setDate(ahora.getDate() - 7)
          coincideTiempo = mFecha >= unaSemanaAtras
        } else if (filtroTiempo === 'mes') {
          coincideTiempo =
            mFecha.getMonth() === ahora.getMonth() && mFecha.getFullYear() === ahora.getFullYear()
        } else if (filtroTiempo === 'trimestre') {
          const tresMesesAtras = new Date()
          tresMesesAtras.setMonth(ahora.getMonth() - 3)
          coincideTiempo = mFecha >= tresMesesAtras
        } else if (filtroTiempo === 'anio') {
          coincideTiempo = mFecha.getFullYear() === ahora.getFullYear()
        }

        return coincideCaja && coincideTipo && coincideTiempo
      })
  }, [movimientosRaw, cajaId, filtroTipo, filtroTiempo])

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
    filtroTiempo,
    setFiltroTiempo,
    loading,
    dataProcesada,
  }
}
