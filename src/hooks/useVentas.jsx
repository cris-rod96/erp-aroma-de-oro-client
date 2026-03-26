import { useState, useEffect, useMemo, useCallback } from 'react'
import { compradorAPI, productoAPI, ventaAPI } from '../api/index.api'
import { useAuthStore } from '../store/useAuthStore'
import { useCajaStore } from '../store/useCajaStore'
import Swal from 'sweetalert2'
import { useEmpresaStore } from '../store/useEmpresaStore'

export const useVentas = () => {
  const token = useAuthStore((state) => state.token)
  const [error, setError] = useState(null)
  const usuarioId = useAuthStore((state) => state.user?.id)
  const { caja } = useCajaStore()

  const [compradores, setCompradores] = useState([])
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const empresa = useEmpresaStore((store) => store.empresa)
  const [loading, setLoading] = useState(false)

  const [tipoBusqueda, setTipoBusqueda] = useState('Cédula')
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [compradorInfo, setCompradorInfo] = useState(null)

  const [formData, setFormData] = useState({
    ProductoId: '',
    unidad: 'Quintales',
    cantidad: '', // Peso Bruto
    calificacion: 0,
    impurezas: 0,
    descuentoMerma: 0,
    precio: '',
    // --- NUEVOS CAMPOS DE RETENCIÓN ---
    retencionConcepto: '',
    retencionPorcentaje: 0,
    // ----------------------------------
    anticipo: 0, // Dinero recibido previamente
    esCredito: false,
    abonoManual: '', // Lo que paga en el momento
  })

  const fetchVentasData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [resComp, resProd, resVent] = await Promise.all([
        compradorAPI.listarTodos(token),
        productoAPI.listarProductos(token),
        ventaAPI.listarVentas(token),
      ])
      setCompradores(resComp.data.compradores || [])
      setProductos(resProd.data.productos || [])
      setVentas(resVent.data.ventas || [])

      if (resProd.data.productos?.length > 0 && !formData.ProductoId) {
        setFormData((prev) => ({ ...prev, ProductoId: resProd.data.productos[0].id }))
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al obtener ventas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchVentasData()
  }, [fetchVentasData])

  const calculos = useMemo(() => {
    const bruto = parseFloat(formData.cantidad) || 0
    const calif = parseFloat(formData.calificacion) || 0
    const impur = parseFloat(formData.impurezas) || 0
    const merma = parseFloat(formData.descuentoMerma) || 0
    const prec = parseFloat(formData.precio) || 0

    // Valores financieros
    const retPorcentaje = parseFloat(formData.retencionPorcentaje) || 0
    const anticipoRecibido = parseFloat(formData.anticipo) || 0

    // 1. Cálculo de Merma y Peso Neto
    const descCalif = (bruto * calif) / 100
    const descImpur = (bruto * impur) / 100
    const cantidadNeta = bruto - (descCalif + descImpur + merma)

    // 2. Cálculo Monetario Base
    const subtotalBruto = cantidadNeta > 0 ? cantidadNeta * prec : 0

    // 3. Cálculo de Retenciones y Líquido
    const valorRetenido = (subtotalBruto * retPorcentaje) / 100
    const totalALiquidar = subtotalBruto - valorRetenido - anticipoRecibido

    // 4. Lo que el cliente abona físicamente hoy
    // (si es crédito usa el input, si es contado asume que paga todo el líquido restante)
    const abonoHoy = formData.esCredito ? parseFloat(formData.abonoManual) || 0 : totalALiquidar

    // 5. Saldo final adeudado
    const saldoFinal = totalALiquidar - abonoHoy

    const productoActual = productos.find((p) => p.id === formData.ProductoId)
    const stockExcedido = productoActual ? bruto > productoActual.stock : false

    return {
      cantidadNeta: cantidadNeta > 0 ? cantidadNeta : 0,
      subtotalBruto,
      totalFactura: subtotalBruto,
      valorRetenido, // <-- Nuevo
      totalALiquidar: totalALiquidar > 0 ? totalALiquidar : 0, // <-- Nuevo
      abonado: abonoHoy,
      anticipo: anticipoRecibido,
      saldo: saldoFinal > 0 ? saldoFinal : 0,
      stockExcedido,
    }
  }, [formData, productos])

  const buscarComprador = () => {
    const encontrado = compradores.find(
      (c) =>
        c.numeroIdentificacion === cedulaBusqueda.trim() && c.tipoIdentificacion === tipoBusqueda
    )
    setCompradorInfo(encontrado || null)
    return encontrado
  }

  const handleFinalizarVenta = async () => {
    if (!caja) return Swal.fire('Caja Cerrada', 'Debe abrir caja primero', 'error')
    if (!compradorInfo) return Swal.fire('Atención', 'Seleccione un comprador', 'warning')

    const confirm = await Swal.fire({
      title:
        '<span style="font-size: 14px; font-weight: 900; letter-spacing: 1px;">RESUMEN DE LIQUIDACIÓN</span>',
      html: `
        <div style="padding: 10px; border: 1px solid #000; font-family: monospace; text-transform: uppercase;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
            <span>PESO NETO:</span>
            <span style="font-weight: 900;">${calculos.cantidadNeta.toFixed(2)} ${formData.unidad}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
            <span>TOTAL MERCADERÍA:</span>
            <span style="font-weight: 900;">$${calculos.totalFactura.toFixed(2)}</span>
          </div>

          ${
            parseFloat(formData.retencionPorcentaje) > 0
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; color: #dc2626;">
            <span>(-) RETENCIÓN (${formData.retencionPorcentaje}%):</span>
            <span style="font-weight: 900;">-$${calculos.valorRetenido.toFixed(2)}</span>
          </div>
          `
              : ''
          }

          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; color: #2563eb;">
            <span>(-) ANTICIPO PREVIO:</span>
            <span style="font-weight: 900;">-$${calculos.anticipo.toFixed(2)}</span>
          </div>

          <div style="border-top: 1px solid #ccc; margin-top: 5px; padding-top: 5px; display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; color: #000;">
            <span style="font-weight: 900;">TOTAL A LIQUIDAR:</span>
            <span style="font-weight: 900;">$${calculos.totalALiquidar.toFixed(2)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; color: #059669;">
            <span>(-) ABONO RECIBIDO HOY:</span>
            <span style="font-weight: 900;">-$${calculos.abonado.toFixed(2)}</span>
          </div>
          <div style="border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 15px; background: #f3f4f6;">
            <span style="font-weight: 900;">SALDO PENDIENTE:</span>
            <span style="font-weight: 900;">$${calculos.saldo.toFixed(2)}</span>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'CONFIRMAR DESPACHO',
      cancelButtonText: 'CORREGIR',
      reverseButtons: true,
      customClass: {
        popup: 'border-2 border-black rounded-none shadow-none',
      },
    })

    if (confirm.isConfirmed) {
      setLoading(true)
      try {
        const payload = {
          PersonaId: compradorInfo.id,
          ProductoId: formData.ProductoId,
          UsuarioId: usuarioId,
          CajaId: caja.id,
          cantidadBruta: parseFloat(formData.cantidad),
          cantidadNeta: calculos.cantidadNeta,
          calificacion: parseFloat(formData.calificacion),
          impurezas: parseFloat(formData.impurezas),
          descuentoMerma: parseFloat(formData.descuentoMerma),
          precioUnitario: parseFloat(formData.precio),
          unidad: formData.unidad,
          // --- DATOS FINANCIEROS Y RETENCIONES ---
          totalFactura: calculos.totalFactura,
          retencionConcepto: formData.retencionConcepto,
          retencionPorcentaje: parseFloat(formData.retencionPorcentaje) || 0,
          valorRetenido: calculos.valorRetenido,
          montoAnticipo: calculos.anticipo,
          totalALiquidar: calculos.totalALiquidar,
          montoAbonado: calculos.abonado,
          montoPendiente: calculos.saldo,
          tipoVenta: formData.esCredito ? 'Crédito' : 'Contado',
        }

        await ventaAPI.registrarVenta({ venta: payload, CajaId: caja.id }, token)

        // Limpiar formulario tras éxito
        setFormData({
          ...formData,
          cantidad: '',
          precio: '',
          abonoManual: '',
          anticipo: 0,
          retencionConcepto: '',
          retencionPorcentaje: 0,
          esCredito: false,
        })
        setCompradorInfo(null)
        setCedulaBusqueda('')
        fetchVentasData()
        Swal.fire('Éxito', 'Venta registrada', 'success')
      } catch (error) {
        console.log(error.response?.data?.message || error)
        Swal.fire('Error', error.response?.data?.message || 'No se pudo procesar', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const registrarNuevoComprador = async (data) => {
    setLoading(true)
    try {
      const res = await compradorAPI.agregarComprador(
        { ...data, UsuarioId: usuarioId, tipo: 'Comprador', tipoIdentificacion: tipoBusqueda },
        token
      )
      await fetchVentasData()
      setCompradorInfo(res.data.comprador)
      return true
    } catch (error) {
      const msg = error.response?.data.message || 'Error al registrar comprador'
      Swal.fire('Error en el registro', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    productos,
    ventas,
    empresa,
    caja,
    loading,
    tipoBusqueda,
    setTipoBusqueda,
    cedulaBusqueda,
    setCedulaBusqueda,
    compradorInfo,
    formData,
    setFormData,
    calculos,
    error,
    isFormDisabled: !caja || loading,
    buscarComprador,
    handleFinalizarVenta,
    registrarNuevoComprador,
  }
}
