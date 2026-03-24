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
      console.log(respLiq.data)
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

  // --- MOTOR DE CÁLCULOS ACTUALIZADO ---
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

    // Valor neto que el productor debería recibir legalmente
    const netoAPagar = valBruto - valRetenido

    const montoPagosHoy = Object.values(pagos).reduce(
      (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
      0
    )

    // El abono total es lo que YA NO se le debe (pagos hoy + deuda cruzada)
    const abonadoTotal = montoPagosHoy + antic

    // El saldo real es el neto legal menos lo abonado/cruzado
    const saldo = netoAPagar - abonadoTotal

    return {
      pesoBruto: q,
      mermaCalificacion: mermaH,
      mermaImpurezas: mermaI,
      totalMerma: totalM,
      pesoNeto: pNeto,
      bruto: valBruto,
      valorRetenido: valRetenido,
      totalAPagar: netoAPagar, // Total antes de cruces y pagos
      montoAbonadoTotal: montoPagosHoy, // Solo efectivo/banco para la vista
      saldoADeber: saldo, // Saldo final real
    }
  }, [cantidad, calificacion, impurezas, precio, retencionPorcentaje, pagos, montoAplicarAnticipo])

  const buscarProductor = async () => {
    if (!cedulaBusqueda) return
    const encontrado = productores.find((p) => p.numeroIdentificacion === cedulaBusqueda)
    if (encontrado) {
      setProductorInfo(encontrado)
      setMostrarFormProductor(false)
      try {
        const respAnt = await anticipoAPI.obtenerPendientesPorPersona(encontrado.id, token)
        console.log(respAnt.data)
        setAnticiposPendientes(respAnt.data.anticipos || [])
        setMontoAplicarAnticipo(0)
      } catch (error) {
        setAnticiposPendientes([])
      }
    } else {
      setProductorInfo(null)
      setAnticiposPendientes([])
      setMostrarFormProductor(true)
      setNuevoProductor({
        ...nuevoProductor,
        numeroIdentificacion: cedulaBusqueda,
        nombreCompleto: '',
        telefono: '',
      })
    }
  }

  const handleRegistrarProductor = async () => {
    if (!nuevoProductor.nombreCompleto || !nuevoProductor.telefono) {
      return Swal.fire('Faltan datos', 'Nombre y teléfono obligatorios', 'warning')
    }
    try {
      setLoading(true)
      await productorAPI.agregarProductor(nuevoProductor, token)
      await fetchInicial()
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
    // 1. VALIDACIONES DE SEGURIDAD
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

    // Validación: El anticipo no puede exceder el valor neto de la carga
    if (parseFloat(montoAplicarAnticipo || 0) > calculos.totalAPagar) {
      return Swal.fire(
        'Error en Anticipo',
        'El cruce de anticipo no puede ser mayor al Total Neto a Pagar',
        'error'
      )
    }

    // Función interna para asegurar 2 decimales y tipo Number (Evita el .9999998)
    const toNum = (val) => Number(Number(val || 0).toFixed(2))

    // 2. CONSTRUCCIÓN DEL OBJETO PARA EL BACKEND
    const data = {
      CajaId: caja.id,

      liquidacion: {
        ProductorId: productorInfo.id,
        UsuarioId: user.id,

        // Valores de la transacción
        totalLiquidacion: toNum(calculos.bruto), // Subtotal bruto
        totalRetencion: toNum(calculos.valorRetenido), // Monto retenido
        totalAPagar: toNum(calculos.totalAPagar), // Neto final

        // Desglose de pagos realizados hoy
        abonoAnticipo: toNum(montoAplicarAnticipo), // Lo que se descuenta del anticipo
        pagoEfectivo: toNum(pagos.efectivo),
        pagoCheque: toNum(pagos.cheque),
        pagoTransferencia: toNum(pagos.transferencia),

        // Monto total que sale de la operación (Pagos hoy + Cruce)
        montoAbonado: toNum(calculos.montoAbonadoTotal + (parseFloat(montoAplicarAnticipo) || 0)),

        // Saldo que queda pendiente por pagar al productor (Crédito)
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

        // Mermas y descuentos
        humedad: 0, // Eliminado/Seteado en 0 porque ya va en calificación
        impurezas: toNum(impurezas),
        descuentoMerma: toNum(calculos.totalMerma),
      },

      // Si hay anticipo seleccionado y monto, enviamos el objeto, si no null
      anticipo:
        anticiposPendientes.length > 0 && parseFloat(montoAplicarAnticipo) > 0
          ? {
              id: anticiposPendientes[0].id,
              montoAplicado: toNum(montoAplicarAnticipo),
            }
          : null,

      // Datos de la retención si aplica
      retencion:
        parseFloat(retencionPorcentaje) > 0
          ? {
              descripcion: retencionConcepto || 'RETENCION EN LA FUENTE',
              porcentajeRetencion: toNum(retencionPorcentaje),
              valorRetenido: toNum(calculos.valorRetenido),
            }
          : null,
    }

    // 3. ENVÍO DE DATOS
    try {
      setLoading(true)
      console.log('Objeto Aroma de Oro listo para enviar:', data)

      // Descomenta esto cuando estés listo para conectar
      const resp = await liquidacionAPI.crearLiquidacion(token, data)

      await Swal.fire({
        title: '¡Liquidación Guardada!',
        text: 'El registro se ha procesado con éxito',
        icon: 'success',
        confirmButtonColor: '#10b981', // Verde esmeralda para que combine
      })

      // Limpieza de formulario y actualización de datos
      resetForm()
      fetchInicial()
      setCaja(resp.data.caja) // Si el backend te devuelve la caja actualizada
    } catch (error) {
      console.error('Error al guardar liquidación:', error)
      Swal.fire(
        'Error de Guardado',
        error.response?.data?.message || 'No se pudo conectar con el servidor',
        'error'
      )
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
