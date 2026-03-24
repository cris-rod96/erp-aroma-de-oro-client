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
  const [liquidaciones, setLiquidaciones] = useState([])
  const [productores, setProductores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)

  const [anticiposPendientes, setAnticiposPendientes] = useState([])
  const [montoAplicarAnticipo, setMontoAplicarAnticipo] = useState(0)

  const [selectedLiq, setSelectedLiq] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [mostrarFormProductor, setMostrarFormProductor] = useState(false)

  // NUEVO: Estado para controlar el dropdown de sugerencias
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
  const [calificacion, setCalificacion] = useState(0)
  const [impurezas, setImpurezas] = useState(0)
  const [cantidad, setCantidad] = useState(0)
  const [precio, setPrecio] = useState(0)
  const [unidad, setUnidad] = useState('Quintales')

  const [retencionConcepto, setRetencionConcepto] = useState('')
  const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)
  const [pagos, setPagos] = useState({ efectivo: 0, cheque: 0, transferencia: 0 })

  const { token, data: user } = useAuthStore()
  const { caja, setCaja } = useCajaStore()
  const { empresa, setEmpresa } = useEmpresaStore()

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
      console.error('Error en fetch:', error)
    }
  }

  useEffect(() => {
    if (token) fetchInicial()
  }, [token])

  // --- NUEVO: MOTOR DE BÚSQUEDA REACTIVA (Autocomplete) ---
  const productoresFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    if (termino.length < 2) return []

    return productores
      .filter((p) => {
        const cedula = (p.numeroIdentificacion || '').toLowerCase()
        const nombre = (p.nombreCompleto || '').toLowerCase()
        return cedula.includes(termino) || nombre.includes(termino)
      })
      .slice(0, 8) // Limitamos a 8 resultados para la lista
  }, [cedulaBusqueda, productores])

  // --- NUEVA: FUNCIÓN PARA SELECCIONAR PRODUCTOR ---
  const seleccionarProductor = async (productor) => {
    setProductorInfo(productor)
    setCedulaBusqueda(productor.numeroIdentificacion)
    setMostrarSugerencias(false)
    setMostrarFormProductor(false)

    try {
      const respAnt = await anticipoAPI.obtenerPendientesPorPersona(productor.id, token)
      setAnticiposPendientes(respAnt.data.anticipos || [])
      setMontoAplicarAnticipo(0)
    } catch (error) {
      console.error('Error al traer anticipos:', error)
      setAnticiposPendientes([])
    }
  }

  // Modificado para manejar el flujo de "No encontrado -> Nuevo registro"
  const buscarProductor = () => {
    // Si hay una coincidencia exacta o el usuario elige buscar con el botón
    if (productoresFiltrados.length === 1) {
      seleccionarProductor(productoresFiltrados[0])
    } else if (productoresFiltrados.length === 0) {
      setProductorInfo(null)
      setAnticiposPendientes([])
      setMostrarFormProductor(true)
      setMostrarSugerencias(false)

      // Si parece una cédula/RUC lo precargamos en el form
      setNuevoProductor({
        ...nuevoProductor,
        numeroIdentificacion: /^\d+$/.test(cedulaBusqueda) ? cedulaBusqueda : '',
        nombreCompleto: !/^\d+$/.test(cedulaBusqueda) ? cedulaBusqueda.toUpperCase() : '',
        telefono: '',
      })
    }
  }

  // --- MOTOR DE CÁLCULOS ---
  const calculos = useMemo(() => {
    const q = parseFloat(cantidad) || 0
    const h = parseFloat(calificacion) || 0
    const i = parseFloat(impurezas) || 0
    const pUnit = parseFloat(precio) || 0
    const rPorc = parseFloat(retencionPorcentaje) || 0
    const antic = parseFloat(montoAplicarAnticipo) || 0

    const mermaH = q * (h / 100)
    const mermaI = q * (i / 100)
    const totalM = mermaH + mermaI
    const pNeto = q - totalM

    const valBruto = pNeto * pUnit
    const valRetenido = valBruto * (rPorc / 100)
    const netoAPagar = valBruto - valRetenido

    const montoPagosHoy = Object.values(pagos).reduce(
      (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
      0
    )

    const abonadoTotal = montoPagosHoy + antic
    const saldo = netoAPagar - abonadoTotal

    return {
      pesoBruto: q,
      mermaCalificacion: mermaH,
      mermaImpurezas: mermaI,
      totalMerma: totalM,
      pesoNeto: pNeto,
      bruto: valBruto,
      valorRetenido: valRetenido,
      totalAPagar: netoAPagar,
      montoAbonadoTotal: montoPagosHoy,
      saldoADeber: saldo,
    }
  }, [cantidad, calificacion, impurezas, precio, retencionPorcentaje, pagos, montoAplicarAnticipo])

  const handleRegistrarProductor = async () => {
    if (!nuevoProductor.nombreCompleto || !nuevoProductor.telefono) {
      return Swal.fire('Faltan datos', 'Nombre y teléfono obligatorios', 'warning')
    }
    try {
      setLoading(true)
      await productorAPI.agregarProductor(nuevoProductor, token)
      await fetchInicial()

      // Buscamos al recién creado para seleccionarlo
      // const recienCreado = { ...nuevoProductor, id: 'temp' } // El fetch inicial actualizará la lista real
      setCedulaBusqueda(nuevoProductor.numeroIdentificacion)
      buscarProductor()

      Swal.fire('Éxito', 'Productor registrado', 'success')
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear el productor', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    if (!caja || caja.estado !== 'Abierta') {
      return Swal.fire('Caja Cerrada', 'Debe abrir la caja para realizar transacciones', 'warning')
    }
    if (!productorInfo) {
      return Swal.fire('Falta Productor', 'Identifique a un productor antes de continuar', 'error')
    }
    if (calculos.pesoNeto <= 0) {
      return Swal.fire('Peso Inválido', 'El peso neto debe ser mayor a 0 para liquidar', 'warning')
    }
    if (!productoSeleccionado) {
      return Swal.fire('Falta Producto', 'Seleccione un producto de la lista', 'warning')
    }
    if (parseFloat(montoAplicarAnticipo || 0) > calculos.totalAPagar) {
      return Swal.fire('Error en Anticipo', 'El cruce excede el total a pagar', 'error')
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
        montoAbonado: toNum(calculos.montoAbonadoTotal + (parseFloat(montoAplicarAnticipo) || 0)),
        montoPorPagar: toNum(calculos.saldoADeber),
      },
      detalle: {
        ProductoId: productoSeleccionado,
        descripcionProducto:
          productos.find((p) => p.id === productoSeleccionado)?.nombre || 'PRODUCTO',
        calificacion: calificacion,
        unidad: unidad || 'Quintales',
        cantidad: toNum(calculos.pesoBruto),
        cantidadNeta: toNum(calculos.pesoNeto),
        precio: toNum(precio),
        parcial: toNum(calculos.bruto),
        humedad: 0,
        impurezas: toNum(impurezas),
        descuentoMerma: toNum(calculos.totalMerma),
      },
      anticipo:
        anticiposPendientes.length > 0 && parseFloat(montoAplicarAnticipo) > 0
          ? { id: anticiposPendientes[0].id, montoAplicado: toNum(montoAplicarAnticipo) }
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
        title: '¡Liquidación Guardada!',
        text: 'El registro se ha procesado con éxito',
        icon: 'success',
        confirmButtonColor: '#10b981',
      })
      resetForm()
      fetchInicial()
      setCaja(resp.data.caja)
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
    productoresFiltrados, // Exportamos esto para la vista
    mostrarSugerencias, // Exportamos esto para la vista
    setMostrarSugerencias,
    seleccionarProductor, // Exportamos esto para la vista
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
    isFormDisabled: !empresa?.id || !caja || caja.estado !== 'Abierta',
  }
}
