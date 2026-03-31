import { useState, useEffect, useMemo, useCallback } from 'react'
import { compradorAPI, productoAPI, ventaAPI, anticipoAPI } from '../api/index.api'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import Swal from 'sweetalert2'

export const useVentas = () => {
  const { token, user } = useAuthStore()
  const { caja, setCaja } = useCajaStore()
  console.log('Caja: ', caja)
  const { empresa } = useEmpresaStore()
  const [nuevoComprador, setNuevoComprador] = useState({
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    tipo: 'Comprador',
    telefono: '',
    direccion: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Datos de Listado
  const [compradores, setCompradores] = useState([])
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])

  // Gestión de Comprador y Deuda
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [compradorInfo, setCompradorInfo] = useState(null)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const [deudaAnterior, setDeudaAnterior] = useState(0)
  const [idCuentaPorCobrarPendiente, setIdCuentaPorCobrarPendiente] = useState(null)
  const [mostrarFormComprador, setMostrarFormComprador] = useState(false)

  // Formulario de Venta
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [unidad, setUnidad] = useState('Quintales') // Unidad de entrada (física)
  const [unidadPago, setUnidadPago] = useState('Quintales') // Unidad de cálculo (precio)
  const [cantidad, setCantidad] = useState(0)
  const [precio, setPrecio] = useState(0)
  const [calificacion, setCalificacion] = useState(0)
  const [impurezas, setImpurezas] = useState(0)

  const [retencionConcepto, setRetencionConcepto] = useState('')
  const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)

  const [pagos, setPagos] = useState({ efectivo: 0, cheque: 0, transferencia: 0 })
  const [montoAplicarAnticipo, setMontoAplicarAnticipo] = useState(0)
  const [anticiposPendientes, setAnticiposPendientes] = useState([])

  // --- LÓGICA DE CARGA INICIAL ---
  const fetchVentasData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [resComp, resProd, resVent] = await Promise.all([
        compradorAPI.listarTodos(token),
        productoAPI.listarProductos(token),
        ventaAPI.listarVentas(token),
      ])
      setCompradores(resComp.data.compradores || [])
      setProductos(resProd.data.productos || [])
      setVentas(resVent.data.ventas || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener datos')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchVentasData()
  }, [fetchVentasData])

  // --- LÓGICA DE DEUDA ARRASTRADA (CxC) ---
  const calcularDeudaComprador = (comprador) => {
    if (!comprador?.Ventas) return { monto: 0, id: null }
    let totalPendiente = 0
    let cxcId = null

    comprador.Ventas.forEach((v) => {
      // Buscamos en las Cuentas por Cobrar de cada venta del comprador
      const pendiente = v.CuentasPorCobrars?.find((cxc) => cxc.estado === 'Pendiente')
      if (pendiente) {
        totalPendiente += parseFloat(pendiente.saldoPendiente)
        cxcId = pendiente.id
      }
    })
    return { monto: totalPendiente, id: cxcId }
  }

  const compradoresFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    if (termino.length < 2) return []
    return compradores.filter((c) => {
      const cedula = (c.numeroIdentificacion || '').toLowerCase()
      const nombre = (c.nombreCompleto || '').toLowerCase()
      return cedula.includes(termino) || nombre.includes(termino)
    })
  }, [cedulaBusqueda, compradores])

  const seleccionarComprador = async (comprador) => {
    setCompradorInfo(comprador)
    setCedulaBusqueda(comprador.numeroIdentificacion)
    setMostrarSugerencias(false)
    setMostrarFormComprador(false)

    const { monto, id } = calcularDeudaComprador(comprador)
    setDeudaAnterior(monto)
    setIdCuentaPorCobrarPendiente(id)

    // Buscar anticipos que el comprador haya dejado
    try {
      const respAnt = await anticipoAPI.obtenerPendientesPorPersona(comprador.id, token)
      setAnticiposPendientes(respAnt.data.anticipos || [])
      setMontoAplicarAnticipo(0)
    } catch {
      setAnticiposPendientes([])
    }
  }

  const buscarComprador = () => {
    if (compradoresFiltrados.length === 1) {
      seleccionarComprador(compradoresFiltrados[0])
    } else if (compradoresFiltrados.length === 0) {
      setCompradorInfo(null)
      setAnticiposPendientes([])
      setMostrarFormComprador(true)
      setMostrarSugerencias(false)
      setNuevoComprador({
        ...nuevoComprador,
        numeroIdentificacion: /^\d+$/.test(cedulaBusqueda) ? cedulaBusqueda : '',
        nombreCompleto: !/^\d+$/.test(cedulaBusqueda) ? cedulaBusqueda.toUpperCase() : '',
        telefono: '',
      })
    }
  }

  const handleRegistrarComprador = async () => {
    if (!nuevoComprador.nombreCompleto) {
      return Swal.fire('Faltan datos', 'Nombre obligatorio', 'warning')
    }

    try {
      setLoading(true)
      const resp = await compradorAPI.agregarComprador(nuevoComprador, token)
      await fetchVentasData()
      if (resp.data?.persona) {
        await seleccionarComprador(resp.data.persona)
        setMostrarFormComprador(false)
      }
      Swal.fire('Éxito', 'Comprador registrado', 'success')
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al registrar el comprador'
      Swal.fire('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- CÁLCULOS PRECISOS (REGLA DEL QUINTAL) ---
  const calculos = useMemo(() => {
    const qOriginal = parseFloat(cantidad) || 0
    const pUnit = parseFloat(precio) || 0
    const h = parseFloat(calificacion) || 0
    const i = parseFloat(impurezas) || 0

    const CONVERSIONES = { Libras: 1, Kilogramos: 2.20462, Quintales: 100 }
    const factorEntrada = CONVERSIONES[unidad] || 1
    const factorPago = CONVERSIONES[unidadPago] || 1

    // 1. Conversión de Peso
    const qConvertida = (qOriginal * factorEntrada) / factorPago
    const mermaH = qConvertida * (h / 100)
    const mermaI = qConvertida * (i / 100)
    const totalM = mermaH + mermaI

    // 2. Peso Neto con lógica de "Baba" vs Seco
    const pNetoCalculado = qConvertida - totalM
    const prodNombre = productos.find((p) => p.id === productoSeleccionado)?.nombre || ''

    const pNeto = prodNombre.toLowerCase().includes('baba')
      ? pNetoCalculado.toFixed(2)
      : pNetoCalculado > 1
        ? Math.floor(pNetoCalculado)
        : Math.floor(pNetoCalculado * 100) / 100

    // 3. Financiero (Truncado a 2 decimales)
    const brutoCalculado = pNeto * pUnit
    const valBruto = Math.trunc(brutoCalculado * 100) / 100

    const rPorc = parseFloat(retencionPorcentaje) || 0
    const valRetenido = Math.trunc(valBruto * (rPorc / 100) * 100) / 100
    const netoHoy = valBruto - valRetenido

    // 4. Totales con Deuda Anterior
    const antic = parseFloat(montoAplicarAnticipo) || 0
    const deudaVieja = parseFloat(deudaAnterior) || 0
    const totalAFacturarConDeuda = netoHoy + deudaVieja

    const montoPagosHoy = Object.values(pagos).reduce(
      (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
      0
    )
    const abonadoTotal = montoPagosHoy + antic
    const saldo = totalAFacturarConDeuda - abonadoTotal

    // Validación de Stock
    const productoActual = productos.find((p) => p.id === productoSeleccionado)
    const stockExcedido = productoActual ? qConvertida > productoActual.stock : false

    return {
      pesoBruto: qConvertida,
      pesoNeto: parseFloat(pNeto),
      bruto: valBruto,
      valorRetenido: valRetenido,
      netoHoy: netoHoy,
      totalAPagar: totalAFacturarConDeuda,
      montoAbonadoTotal: montoPagosHoy,
      saldoADeber: saldo,
      deudaAnterior: deudaVieja,
      stockExcedido,
    }
  }, [
    cantidad,
    unidad,
    unidadPago,
    calificacion,
    impurezas,
    precio,
    retencionPorcentaje,
    pagos,
    montoAplicarAnticipo,
    deudaAnterior,
    productoSeleccionado,
    productos,
  ])

  // --- ACCIONES ---
  const handleFinalizarVenta = async () => {
    if (!caja || caja.estado !== 'Abierta')
      return Swal.fire('Caja Cerrada', 'Abra caja primero', 'warning')
    if (!compradorInfo) return Swal.fire('Falta Comprador', 'Identifique al cliente', 'error')
    if (calculos.pesoNeto <= 0)
      return Swal.fire('Peso Inválido', 'El peso neto debe ser mayor a 0', 'warning')
    if (calculos.stockExcedido)
      return Swal.fire('Sin Stock', 'La cantidad supera el stock disponible', 'error')

    const toNum = (val) => Number(Number(val || 0).toFixed(2))

    const data = {
      CajaId: caja.id,
      venta: {
        PersonaId: compradorInfo.id,
        UsuarioId: user.id,
        totalFactura: toNum(calculos.bruto),
        totalRetencion: toNum(calculos.valorRetenido),
        totalALiquidar: toNum(calculos.totalAPagar),
        montoAnticipo: toNum(montoAplicarAnticipo),
        montoAbonado: toNum(calculos.montoAbonadoTotal),
        montoPendiente: toNum(calculos.saldoADeber),
        tipoVenta: calculos.saldoADeber > 0 ? 'Crédito' : 'Contado',

        // CxC Arrastrada
        cuentaPorCobrarSaldadaId: idCuentaPorCobrarPendiente,
        montoDeudaAnterior: toNum(deudaAnterior),

        // Pagos detallados para la caja
        pagoEfectivo: toNum(pagos.efectivo),
        pagoCheque: toNum(pagos.cheque),
        pagoTransferencia: toNum(pagos.transferencia),
      },
      detalle: {
        ProductoId: productoSeleccionado,
        cantidadBruta: toNum(calculos.pesoBruto),
        cantidadNeta: toNum(calculos.pesoNeto),
        precioUnitario: toNum(precio),
        unidad: unidadPago,
        calificacion: calificacion,
        impurezas: impurezas,
        descuentoMerma: toNum(calculos.pesoBruto - calculos.pesoNeto),
      },
      retencion:
        parseFloat(retencionPorcentaje) > 0
          ? {
              descripcion: retencionConcepto || 'RETENCION IVA/FUENTE',
              porcentajeRetencion: toNum(retencionPorcentaje),
              valorRetenido: toNum(calculos.valorRetenido),
            }
          : null,
    }

    try {
      setLoading(true)
      console.log(data)
      const resp = await ventaAPI.registrarVenta(data, token)
      await Swal.fire('Éxito', 'Venta y despacho registrados', 'success')
      resetForm()
      fetchVentasData()
      if (resp.data.caja) setCaja(resp.data.caja)
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error de servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCompradorInfo(null)
    setCedulaBusqueda('')
    setCantidad(0)
    setPrecio(0)
    setProductoSeleccionado('')
    setPagos({ efectivo: 0, cheque: 0, transferencia: 0 })
    setDeudaAnterior(0)
    setMontoAplicarAnticipo(0)
  }

  return {
    ...calculos,
    productos,
    ventas,
    loading,
    compradorInfo,
    cedulaBusqueda,
    setCedulaBusqueda,
    seleccionarComprador,
    mostrarSugerencias,
    setMostrarSugerencias,
    productoSeleccionado,
    setProductoSeleccionado,
    cantidad,
    setCantidad,
    precio,
    setPrecio,
    unidad,
    setUnidad,
    unidadPago,
    setUnidadPago,
    calificacion,
    setCalificacion,
    impurezas,
    setImpurezas,
    retencionConcepto,
    setRetencionConcepto,
    retencionPorcentaje,
    setRetencionPorcentaje,
    pagos,
    setPagos,
    caja,
    montoAplicarAnticipo,
    setMontoAplicarAnticipo,
    handleFinalizarVenta,
    isFormDisabled: !caja || caja.estado !== 'Abierta' || loading,
    compradoresFiltrados,
    buscarComprador,
    nuevoComprador,
    setNuevoComprador,
    mostrarFormComprador,
    setMostrarFormComprador,
    setCompradorInfo,
    compradores,
    handleRegistrarComprador,
  }
}
