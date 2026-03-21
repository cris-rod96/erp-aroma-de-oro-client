import { useState, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import { useEmpresaStore } from '../store/useEmpresaStore'
import { empresaAPI, liquidacionAPI, productoAPI, productorAPI } from '../api/index.api'

export const useLiquidacion = () => {
  // Datos maestros
  const [liquidaciones, setLiquidaciones] = useState([])
  const [productores, setProductores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)

  // Control de UI
  const [selectedLiq, setSelectedLiq] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [mostrarFormProductor, setMostrarFormProductor] = useState(false)

  // Formulario Productor
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

  // Formulario Liquidación
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [calificacion, setCalificacion] = useState('')
  const [unidad, setUnidad] = useState('Quintales')
  const [cantidad, setCantidad] = useState(0)
  const [precio, setPrecio] = useState(0)
  const [prima, setPrima] = useState(0)
  const [ivaPorcentaje, setIvaPorcentaje] = useState(0)
  const [humedad, setHumedad] = useState(12)
  const [impurezas, setImpurezas] = useState(0)
  const [retencionConcepto, setRetencionConcepto] = useState('')
  const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)
  const [descuento, setDescuento] = useState(0)
  const [pagos, setPagos] = useState({ efectivo: 0, cheque: 0, transferencia: 0 })

  const { token, adminData: user } = useAuthStore()
  const { caja, setCaja } = useCajaStore()
  const { empresa, setEmpresa } = useEmpresaStore()

  const HUMEDAD_BASE = 12

  const fetchInicial = async () => {
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
      console.error('Error inicial:', error)
    }
  }

  useEffect(() => {
    if (token) fetchInicial()
  }, [token])

  // LÓGICA DE CÁLCULOS
  const calculos = useMemo(() => {
    const pesoBruto = parseFloat(cantidad || 0)
    const hActual = parseFloat(humedad || 0)
    const iActual = parseFloat(impurezas || 0)
    const pUnitario = parseFloat(precio || 0)
    const valorPrimaFija = parseFloat(prima || 0)
    const pIva = parseFloat(ivaPorcentaje || 0)

    const mermaHumedad =
      hActual > HUMEDAD_BASE ? pesoBruto * ((hActual - HUMEDAD_BASE) / (100 - HUMEDAD_BASE)) : 0
    const mermaImpurezas = pesoBruto * (iActual / 100)
    const totalMerma = mermaHumedad + mermaImpurezas
    const pesoNeto = pesoBruto - totalMerma

    // SUBOTOTAL FILA: (Peso * Precio) + Prima en Dólares (Fija)
    const bruto = pesoNeto * pUnitario + valorPrimaFija
    const valorIVA = bruto * (pIva / 100)
    const parcial = bruto + valorIVA

    const valorRetenido = parcial * (parseFloat(retencionPorcentaje || 0) / 100)
    const totalAPagar = parcial - valorRetenido - parseFloat(descuento || 0)

    const montoAbonado = Object.values(pagos).reduce(
      (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
      0
    )
    const saldoADeber = totalAPagar - montoAbonado

    return {
      pesoBruto,
      pesoNeto,
      totalMerma,
      mermaHumedad,
      mermaImpurezas,
      bruto,
      parcial,
      valorIVA,
      valorRetenido,
      totalAPagar,
      montoAbonado,
      saldoADeber,
    }
  }, [
    cantidad,
    humedad,
    impurezas,
    precio,
    prima,
    ivaPorcentaje,
    retencionPorcentaje,
    descuento,
    pagos,
  ])

  const buscarProductor = () => {
    const encontrado = productores.find((p) => p.numeroIdentificacion === cedulaBusqueda)
    if (encontrado) {
      setProductorInfo(encontrado)
      setMostrarFormProductor(false)
    } else {
      setProductorInfo(null)
      setMostrarFormProductor(true)
      setNuevoProductor({ ...nuevoProductor, numeroIdentificacion: cedulaBusqueda })
    }
  }

  const handleRegistrarProductor = async () => {
    if (!nuevoProductor.nombreCompleto || !nuevoProductor.telefono) {
      return Swal.fire('Faltan datos', 'Nombre y teléfono obligatorios', 'warning')
    }
    try {
      setLoading(true)
      await productorAPI.agregarProductor(nuevoProductor, token)
      const cedula = nuevoProductor.numeroIdentificacion
      await fetchInicial()
      setCedulaBusqueda(cedula)
      setMostrarFormProductor(false)
      Swal.fire('Éxito', 'Productor registrado', 'success')
    } catch (error) {
      Swal.fire('Error', 'No se pudo registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    if (!caja || caja.estado !== 'Abierta') return Swal.fire('Caja Cerrada', 'Abra caja', 'warning')
    if (!productorInfo) return Swal.fire('Error', 'Identifique al productor', 'error')

    // VALIDACIÓN DINERO EN CAJA
    const pagoEfectivo = parseFloat(pagos.efectivo || 0)
    const saldoCaja = parseFloat(caja.saldoActual || 0)
    if (pagoEfectivo > saldoCaja) {
      return Swal.fire(
        'Saldo Insuficiente',
        `No hay suficiente efectivo en caja. Disponible: $${saldoCaja.toFixed(2)}`,
        'error'
      )
    }

    const data = {
      liquidacion: {
        subtotal_12: parseFloat(ivaPorcentaje) > 0 ? calculos.bruto : 0,
        subtotal_0: parseFloat(ivaPorcentaje) === 0 ? calculos.bruto : 0,
        ivaTotal: calculos.valorIVA,
        totalRetencion: calculos.valorRetenido,
        totalLiquidacion: calculos.bruto,
        totalAPagar: calculos.totalAPagar,
        pagoEfectivo: pagoEfectivo,
        pagoCheque: parseFloat(pagos.cheque || 0),
        pagoTransferencia: parseFloat(pagos.transferencia || 0),
        montoAbonado: calculos.montoAbonado,
        montoPorPagar: calculos.saldoADeber,
        UsuarioId: user.id,
        ProductorId: productorInfo.id,
      },
      detalle: {
        descripcionProducto:
          productos.find((p) => p.id === productoSeleccionado)?.nombre || 'VARIOS',
        calificacion,
        porcentajeIVa: parseFloat(ivaPorcentaje),
        unidad,
        cantidad: calculos.pesoBruto,
        humedad: parseFloat(humedad),
        impurezas: parseFloat(impurezas),
        descuentoMerma: parseFloat(calculos.totalMerma.toFixed(4)),
        cantidadNeta: parseFloat(calculos.pesoNeto.toFixed(4)),
        precio: parseFloat(precio),
        prima: parseFloat(prima),
        parcial: calculos.parcial,
        ProductoId: productoSeleccionado,
      },
      retencion:
        retencionPorcentaje > 0
          ? {
              descripcion: retencionConcepto || 'RETENCION EN LA FUENTE',
              porcentajeRetencion: parseFloat(retencionPorcentaje),
              valorRetenido: calculos.valorRetenido,
            }
          : null,
      CajaId: caja.id,
    }

    try {
      setLoading(true)
      const resp = await liquidacionAPI.crearLiquidacion(token, data)
      Swal.fire('Éxito', 'Liquidación Guardada', 'success')
      resetForm()
      fetchInicial()
      setCaja(resp.data.caja)
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setProductorInfo(null)
    setCedulaBusqueda('')
    setMostrarFormProductor(false)
    setProductoSeleccionado('')
    setCalificacion('')
    setUnidad('Quintales')
    setCantidad(0)
    setHumedad(12)
    setImpurezas(0)
    setPrecio(0)
    setPrima(0)
    setIvaPorcentaje(0)
    setRetencionConcepto('')
    setRetencionPorcentaje(0)
    setDescuento(0)
    setPagos({ efectivo: 0, cheque: 0, transferencia: 0 })
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
    mostrarFormProductor,
    nuevoProductor,
    setNuevoProductor,
    productoSeleccionado,
    setProductoSeleccionado,
    calificacion,
    setCalificacion,
    unidad,
    setUnidad,
    cantidad,
    setCantidad,
    precio,
    setPrecio,
    prima,
    setPrima,
    ivaPorcentaje,
    setIvaPorcentaje,
    humedad,
    setHumedad,
    impurezas,
    setImpurezas,
    retencionConcepto,
    setRetencionConcepto,
    retencionPorcentaje,
    setRetencionPorcentaje,
    descuento,
    setDescuento,
    pagos,
    setPagos,
    isFormDisabled: !empresa?.id || !caja || caja.estado !== 'Abierta',
    empresa,
    caja,
    buscarProductor,
    handleRegistrarProductor,
    handleGuardar,
  }
}
