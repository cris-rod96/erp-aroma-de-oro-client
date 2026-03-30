import { useState, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import {
  empresaAPI,
  liquidacionAPI,
  productoAPI,
  productorAPI,
  anticipoAPI,
} from '../api/index.api'

export const useLiquidacion = () => {
  const [deudaAnterior, setDeudaAnterior] = useState(0)
  const [idCuentaPorPagarPendiente, setIdCuentaPorPagarPendiente] = useState(null) // ID para saldar
  const [liquidaciones, setLiquidaciones] = useState([])
  const [error, setError] = useState(null)
  const [productores, setProductores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)

  const [anticiposPendientes, setAnticiposPendientes] = useState([])
  const [montoAplicarAnticipo, setMontoAplicarAnticipo] = useState(0)

  const [selectedLiq, setSelectedLiq] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [mostrarFormProductor, setMostrarFormProductor] = useState(false)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [productorInfo, setProductorInfo] = useState(null)
  const [nuevoProductor, setNuevoProductor] = useState({
    nombreCompleto: '',
    tipoIdentificacion: 'Cédula',
    numeroIdentificacion: '',
    tipo: 'Productor',
    telefono: '',
    direccion: '',
  })

  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [unidadProductoSeleccionado, setUnidadProductoSeleccionado] = useState({})

  const [calificacion, setCalificacion] = useState(0)
  const [impurezas, setImpurezas] = useState(0)
  const [cantidad, setCantidad] = useState(0)
  const [precio, setPrecio] = useState(0)
  const [unidad, setUnidad] = useState('Quintales')
  const [unidadPago, setUnidadPago] = useState('Quintales')

  const [retencionConcepto, setRetencionConcepto] = useState('')
  const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)
  const [pagos, setPagos] = useState({ efectivo: 0, cheque: 0, transferencia: 0 })

  const { token, user } = useAuthStore()
  const { caja, setCaja } = useCajaStore()
  const { empresa, setEmpresa } = useEmpresaStore()

  // MODIFICADO: Extrae tanto el monto como el ID de la cuenta por pagar pendiente
  const calcularDeudaAProductor = (productor) => {
    if (!productor?.Liquidacions) return { monto: 0, id: null }

    let totalPendiente = 0
    let cxpId = null

    // Buscamos en las liquidaciones del productor si hay CxP pendientes
    productor.Liquidacions.forEach((liq) => {
      const pendiente = liq.CuentasPorPagars?.find((cxp) => cxp.estado === 'Pendiente')
      if (pendiente) {
        totalPendiente += parseFloat(pendiente.saldoPendiente)
        cxpId = pendiente.id // Capturamos el ID de la cuenta que se va a saldar
      }
    })

    return { monto: totalPendiente, id: cxpId }
  }

  const [filtros, setFiltros] = useState({
    fecha: '',
    productorId: 'todos',
    estado: 'todos',
  })

  const liquidacionesFiltradas = useMemo(() => {
    return liquidaciones.filter((liq) => {
      const coincidirFecha = !filtros.fecha || liq.createdAt.startsWith(filtros.fecha)
      const coincidirProductor =
        filtros.productorId === 'todos' || liq.ProductorId === filtros.productorId
      const coinciderEstado = filtros.estado === 'todos' || liq.estado === filtros.estado
      return coincidirFecha && coincidirProductor && coinciderEstado
    })
  }, [liquidaciones, filtros])

  const fetchInicial = async () => {
    setError(null)
    try {
      const [respProd, respEmpresa, respLiq, respItems] = await Promise.all([
        productorAPI.listarTodos(token),
        empresaAPI.obtenerInformacion(token),
        liquidacionAPI.listarTodas(token),
        productoAPI.listarProductos(token),
      ])
      setProductores(respProd.data.productores || [])
      setEmpresa(respEmpresa.data.empresa || null)
      setLiquidaciones(respLiq.data.liquidaciones || [])
      setProductos(respItems.data.productos || [])
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al cargar la información'
      setError(msg)
    }
  }

  const resetFiltros = async () => {
    setFiltros({ fecha: '', productorId: 'todos', estado: 'todos' })
    fetchInicial()
  }

  useEffect(() => {
    if (token) fetchInicial()
  }, [token])

  const productoresFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    if (termino.length < 2) return []
    return productores
      .filter((p) => {
        const cedula = (p.numeroIdentificacion || '').toLowerCase()
        const nombre = (p.nombreCompleto || '').toLowerCase()
        return cedula.includes(termino) || nombre.includes(termino)
      })
      .slice(0, 8)
  }, [cedulaBusqueda, productores])

  const seleccionarProductor = async (productor) => {
    setProductorInfo(productor)
    setCedulaBusqueda(productor.numeroIdentificacion)
    setMostrarSugerencias(false)
    setMostrarFormProductor(false)

    // Obtenemos los datos de la deuda arrastrada
    const { monto, id } = calcularDeudaAProductor(productor)
    setDeudaAnterior(monto)
    setIdCuentaPorPagarPendiente(id)

    try {
      const respAnt = await anticipoAPI.obtenerPendientesPorPersona(productor.id, token)
      setAnticiposPendientes(respAnt.data.anticipos || [])
      setMontoAplicarAnticipo(0)
    } catch (error) {
      setAnticiposPendientes([])
    }
  }

  const buscarProductor = () => {
    if (productoresFiltrados.length === 1) {
      seleccionarProductor(productoresFiltrados[0])
    } else if (productoresFiltrados.length === 0) {
      setProductorInfo(null)
      setAnticiposPendientes([])
      setMostrarFormProductor(true)
      setMostrarSugerencias(false)
      setNuevoProductor({
        ...nuevoProductor,
        numeroIdentificacion: /^\d+$/.test(cedulaBusqueda) ? cedulaBusqueda : '',
        nombreCompleto: !/^\d+$/.test(cedulaBusqueda) ? cedulaBusqueda.toUpperCase() : '',
        telefono: '',
      })
    }
  }

  const CONVERSIONES = {
    Libras: 1,
    Kilogramos: 2.2, // 1 kg = 2.20462 lbs
    Quintales: 100, // 1 qq = 100 lbs
  }

  // const calculos = useMemo(() => {
  //   const q = parseFloat(cantidad) || 0
  //   const h = parseFloat(calificacion) || 0
  //   const i = parseFloat(impurezas) || 0
  //   const pUnit = parseFloat(precio) || 0
  //   const rPorc = parseFloat(retencionPorcentaje) || 0
  //   const antic = parseFloat(montoAplicarAnticipo) || 0
  //   const deudaVieja = parseFloat(deudaAnterior) || 0

  //   const mermaH = q * (h / 100)
  //   const mermaI = q * (i / 100)
  //   const totalM = mermaH + mermaI
  //   const pNeto = q - totalM

  //   const valBruto = pNeto * pUnit
  //   const valRetenido = valBruto * (rPorc / 100)

  //   const netoHoy = valBruto - valRetenido
  //   const totalaPagarConDeuda = netoHoy + deudaVieja

  //   const montoPagosHoy = Object.values(pagos).reduce(
  //     (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
  //     0
  //   )

  //   const abonadoTotal = montoPagosHoy + antic
  //   const saldo = totalaPagarConDeuda - abonadoTotal

  //   return {
  //     pesoBruto: q,
  //     mermaCalificacion: mermaH,
  //     mermaImpurezas: mermaI,
  //     totalMerma: totalM,
  //     pesoNeto: pNeto,
  //     bruto: valBruto,
  //     valorRetenido: valRetenido,
  //     netoHoy: netoHoy,
  //     totalAPagar: totalaPagarConDeuda,
  //     montoAbonadoTotal: montoPagosHoy,
  //     saldoADeber: saldo,
  //     deudaAnterior: deudaVieja,
  //   }
  // }, [
  //   cantidad,
  //   calificacion,
  //   impurezas,
  //   precio,
  //   retencionPorcentaje,
  //   pagos,
  //   montoAplicarAnticipo,
  //   deudaAnterior,
  // ])
  const calculos = useMemo(() => {
    // 1. Entradas base
    const qOriginal = parseFloat(cantidad) || 0
    const pUnit = parseFloat(precio) || 0
    const h = parseFloat(calificacion) || 0
    const i = parseFloat(impurezas) || 0

    // Constantes de conversión (Asegúrate de tenerlas definidas fuera o pasarlas)
    const CONVERSIONES = {
      Libras: 1,
      Kilogramos: 2.20462,
      Quintales: 100,
    }

    // 2. LÓGICA DE CONVERSIÓN
    const factorEntrada = CONVERSIONES[unidad] || 1
    const factorPago = CONVERSIONES[unidadPago] || 1

    console.log(factorEntrada, factorPago)

    // Convertimos la cantidad recibida a la unidad en la que se va a pagar
    const qConvertida = (qOriginal * factorEntrada) / factorPago
    console.log(qOriginal, factorEntrada, factorPago)

    // 3. Cálculos de Merma
    const mermaH = qConvertida * (h / 100)
    const mermaI = qConvertida * (i / 100)
    const totalM = mermaH + mermaI

    // PESO NETO:
    // Para que 59 libras con 72% de merma de 16 exactos (y así 16 * 1.05 = 16.80)
    // Usamos Math.floor para no "regalar" decimales de peso al productor.
    // Si el resultado es muy pequeño (menor a 1), permitimos decimales para que no sea 0.
    const pNetoCalculado = qConvertida - totalM
    const pNeto =
      pNetoCalculado > 1 ? Math.floor(pNetoCalculado) : Math.round(pNetoCalculado * 100) / 100

    console.log(unidadProductoSeleccionado)

    // 4. CÁLCULOS MONETARIOS (Regla del Quintal)
    // El precio (pUnit) se asume por Quintal, por eso dividimos para 100
    const brutoCalculado =
      unidadProductoSeleccionado === 'Quintales' ? pNeto * pUnit : pNeto * pUnit

    // Truncamos el valor monetario a 2 decimales para evitar el redondeo de .toFixed(2)
    const valBruto = Math.trunc(brutoCalculado * 100) / 100

    const rPorc = parseFloat(retencionPorcentaje) || 0
    const valRetenido = Math.trunc(valBruto * (rPorc / 100) * 100) / 100
    const netoHoy = valBruto - valRetenido

    // 5. Deudas y Pagos
    const antic = parseFloat(montoAplicarAnticipo) || 0
    const deudaVieja = parseFloat(deudaAnterior) || 0
    const totalaPagarConDeuda = netoHoy + deudaVieja

    const montoPagosHoy = Object.values(pagos).reduce(
      (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
      0
    )

    const abonadoTotal = montoPagosHoy + antic
    const saldo = totalaPagarConDeuda - abonadoTotal

    return {
      pesoBrutoOriginal: qOriginal,
      pesoBruto: qConvertida,
      mermaCalificacion: mermaH,
      mermaImpurezas: mermaI,
      totalMerma: totalM,
      pesoNeto: pNeto,
      bruto: valBruto,
      valorRetenido: valRetenido,
      netoHoy: netoHoy,
      totalAPagar: totalaPagarConDeuda,
      montoAbonadoTotal: montoPagosHoy,
      saldoADeber: saldo,
      deudaAnterior: deudaVieja,
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
    unidadProductoSeleccionado,
  ])

  const handleRegistrarProductor = async () => {
    if (!nuevoProductor.nombreCompleto) {
      return Swal.fire('Faltan datos', 'Nombre obligatorio', 'warning')
    }
    try {
      setLoading(true)
      const resp = await productorAPI.agregarProductor(nuevoProductor, token)
      await fetchInicial()
      if (resp.data.productor) {
        await seleccionarProductor(resp.data.productor)
      }
      Swal.fire('Éxito', 'Productor registrado', 'success')
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error al registrar productor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    if (!caja || caja.estado !== 'Abierta')
      return Swal.fire('Caja Cerrada', 'Debe abrir la caja', 'warning')

    if (parseFloat(caja.saldoActual) < parseFloat(pagos.efectivo))
      return Swal.fire(
        'Fondos insuficientes',
        'No hay fondos suficientes para ejecutar esta liquidación',
        'warning'
      )
    if (!productorInfo) return Swal.fire('Falta Productor', 'Identifique a un productor', 'error')
    if (calculos.pesoNeto <= 0)
      return Swal.fire('Peso Inválido', 'El peso neto debe ser mayor a 0', 'warning')
    if (!productoSeleccionado)
      return Swal.fire('Falta Producto', 'Seleccione un producto', 'warning')

    const totalPagosDirectos = Object.values(pagos).reduce(
      (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
      0
    )
    const totalAnticipoAplicado = parseFloat(montoAplicarAnticipo) || 0

    if (totalPagosDirectos === 0 && totalAnticipoAplicado === 0) {
      return Swal.fire({
        title: 'Pago Requerido',
        text: 'No se puede liquidar sin montos de pago.',
        icon: 'error',
      })
    }

    const toNum = (val) => Number(Number(val || 0).toFixed(2))

    const data = {
      CajaId: caja.id,
      liquidacion: {
        ProductorId: productorInfo.id,
        UsuarioId: user.id,
        totalLiquidacion: toNum(calculos.bruto),
        totalRetencion: toNum(calculos.valorRetenido),
        totalAPagar: toNum(calculos.totalAPagar),
        abonoAnticipo: toNum(montoAplicarAnticipo),
        pagoEfectivo: toNum(pagos.efectivo),
        pagoCheque: toNum(pagos.cheque),
        pagoTransferencia: toNum(pagos.transferencia),
        montoAbonado: toNum(calculos.montoAbonadoTotal),
        montoPorPagar: toNum(calculos.saldoADeber),

        // ENVIAMOS EL ID DE LA CUENTA QUE ESTAMOS PAGANDO HOY
        cuentaPorPagarSaldadaId: idCuentaPorPagarPendiente,
        montoDeudaAnterior: toNum(deudaAnterior),
      },
      detalle: {
        ProductoId: productoSeleccionado,
        descripcionProducto:
          productos.find((p) => p.id === productoSeleccionado)?.nombre || 'PRODUCTO',
        calificacion: calificacion,
        unidad: unidadPago || 'Quintales',
        cantidad: toNum(calculos.pesoBruto),
        cantidadNeta: toNum(calculos.pesoNeto),
        precio: toNum(precio),
        parcial: toNum(calculos.bruto),
        humedad: 0,
        impurezas: toNum(impurezas),
        descuentoMerma: toNum(calculos.totalMerma),
      },
      anticipo:
        anticiposPendientes.length > 0 && totalAnticipoAplicado > 0
          ? { id: anticiposPendientes[0].id, montoAplicado: toNum(totalAnticipoAplicado) }
          : null,
      retencion:
        parseFloat(retencionPorcentaje) > 0
          ? {
              descripcion: retencionConcepto || 'RETENCION EN LA FUENTE',
              porcentajeRetencion: toNum(retencionPorcentaje),
              valorRetenido: toNum(calculos.valorRetenido),
            }
          : null,
    }

    try {
      setLoading(true)
      const resp = await liquidacionAPI.crearLiquidacion(token, data)
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Liquidación guardada correctamente',
        icon: 'success',
      })
      resetForm()
      fetchInicial()
      if (resp.data.caja) setCaja(resp.data.caja)
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error de servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setProductorInfo(null)
    setCedulaBusqueda('')
    setCantidad(0)
    setImpurezas(0)
    setPrecio(0)
    setCalificacion(0)
    setProductoSeleccionado('')
    setMontoAplicarAnticipo(0)
    setPagos({ efectivo: 0, cheque: 0, transferencia: 0 })
    setAnticiposPendientes([])
    setMostrarSugerencias(false)
    setMostrarFormProductor(false)
    setRetencionPorcentaje(0)
    setRetencionConcepto('')
    setDeudaAnterior(0)
    setIdCuentaPorPagarPendiente(null) // Reset del ID
  }

  return {
    ...calculos,
    liquidaciones,
    productos,
    loading,
    selectedLiq,
    setSelectedLiq,
    showModal,
    setShowModal,
    cedulaBusqueda,
    setCedulaBusqueda,
    productorInfo,
    productoresFiltrados,
    mostrarSugerencias,
    setMostrarSugerencias,
    seleccionarProductor,
    anticiposPendientes,
    montoAplicarAnticipo,
    setMontoAplicarAnticipo,
    mostrarFormProductor,
    setMostrarFormProductor,
    nuevoProductor,
    setNuevoProductor,
    productoSeleccionado,
    setProductoSeleccionado,
    calificacion,
    resetFiltros,
    setCalificacion,
    unidad,
    setUnidad,
    cantidad,
    setCantidad,
    precio,
    setPrecio,
    impurezas,
    setImpurezas,
    retencionConcepto,
    setRetencionConcepto,
    retencionPorcentaje,
    setRetencionPorcentaje,
    pagos,
    setPagos,
    empresa,
    caja,
    buscarProductor,
    handleRegistrarProductor,
    handleGuardar,
    error,
    productores,
    filtros,
    setFiltros,
    liquidacionesFiltradas,
    isFormDisabled: !empresa?.id || !caja || caja.estado !== 'Abierta',
    deudaAnterior,
    unidadPago,
    setUnidadPago,
    setUnidadProductoSeleccionado,
    unidadProductoSeleccionado,
  }
}
