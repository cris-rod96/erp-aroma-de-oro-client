import { useEffect, useMemo, useState } from 'react'
import {
  MdAccountBalance,
  MdAttachMoney,
  MdInfo,
  MdInventory2,
  MdSecurity,
  MdTrendingDown,
  MdTrendingUp,
} from 'react-icons/md'
import Swal from 'sweetalert2'
import cajaAPI from '../../api/caja/caja.api'
import { productoAPI } from '../../api/index.api'
import { CajasHeader, CajasTable, Container, Modal } from '../../components/index.components'
import { useCajas } from '../../hooks/useCajas'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { formatMoney } from '../../utils/fromatters'

const Cajas = () => {
  const token = useAuthStore((state) => state.token)
  const setCaja = useCajaStore((state) => state.setCaja)
  const user = useAuthStore((store) => store.user)
  const [observacionesCierre, setObservacionesCierre] = useState('')

  const {
    cajaActiva,
    cajas,
    fetching,
    montoApertura,
    montoFisicoCierre,
    setLoading,
    loading,
    setIsModalOpen,
    isModalOpen,
    setMontoApertura,
    fetchCajas,
    setIsClosingModal,
    setMontoFisicoCierre,
    isClosingModal,
    error,
    isVentaModalOpen,
    setIsVentaModalOpen,
    ejecutarVentaRapida,
    reabrirCaja,
  } = useCajas(token)

  // Estado de venta rápida
  const [productos, setProductos] = useState([])
  const [ventaData, setVentaData] = useState({
    ProductoId: '',
    cantidad: '',
    unidadVenta: 'Libras',
    precio: '',
    descripcion: '',
  })

  useEffect(() => {
    if (isVentaModalOpen)
      productoAPI.listarProductos(token).then((res) => setProductos(res.data.productos) || [])
  }, [isVentaModalOpen, token])

  const infoVenta = useMemo(() => {
    const prod = productos.find((p) => p.id === ventaData.ProductoId)
    const cantIngresada = parseFloat(ventaData.cantidad) || 0
    const precio = parseFloat(ventaData.precioUnitario) || 0

    const unidadBase = prod?.unidadMedida // Lo que tienes en bodega (QQ, Kg, Lb)
    const unidadVenta = ventaData.unidadVenta // Lo que pide el cliente (Kg, Lb)

    console.log(unidadBase, unidadVenta)

    let cantARestar = cantIngresada

    // --- ESCENARIO 1: STOCK EN QUINTALES ---
    if (unidadBase === 'Quintales') {
      if (unidadVenta === 'Libras') cantARestar = cantIngresada / 100
      if (unidadVenta === 'Kilogramos') cantARestar = cantIngresada / 45.45
    }

    // --- ESCENARIO 2: STOCK EN KILOGRAMOS ---
    else if (unidadBase === 'Kilogramos') {
      if (unidadVenta === 'Libras') cantARestar = cantIngresada / 2.2
      // (Si pide en QQ y base es Kg, se multiplica por 45.45 pero usualmente vendes en unidades menores)
      if (unidadVenta === 'Quintales') cantARestar = cantIngresada * 45.45
    }

    // --- ESCENARIO 3: STOCK EN LIBRAS (Lo que te faltaba) ---
    else if (unidadBase === 'Libras') {
      if (unidadVenta === 'Kilogramos') cantARestar = cantIngresada * 2.2 // 1kg son 2.2lb
      // Si por alguna razón vendieras un Quintal y tu base es Libras:
      if (unidadVenta === 'Quintales') cantARestar = cantIngresada * 100
    }

    // --- LIMPIEZA DE DATOS ---
    const cantFinal = Number(cantARestar.toFixed(2)) // Redondeo a 2 decimales y conversión a número
    const stockActual = parseFloat(prod?.stock || 0)
    const stockResultante = Number((stockActual - cantFinal).toFixed(2))

    return {
      totalDinero: (cantIngresada * precio).toFixed(2),
      cantARestar: cantFinal,
      stockResultante,
      unidadBase: unidadBase || '',
      stockSuficiente: stockActual >= cantFinal,
    }
  }, [ventaData, productos])

  const [isBancoModalOpen, setIsBancoModalOpen] = useState(false)
  const [montoBanco, setMontoBanco] = useState('')
  const [descBanco, setDescBanco] = useState('')

  // --- LÓGICA DE AUDITORÍA BASADA EN TU ESTRUCTURA DE DATOS ---
  const movimientos = cajaActiva?.Movimientos || []

  // 1. INGRESOS FÍSICOS (Efectivo real)
  const totalIngresosEfectivo = movimientos
    .filter((m) => {
      const esIngreso = m.tipoMovimiento === 'Ingreso'
      const desc = m.descripcion?.toUpperCase() || ''
      // Si la descripción menciona bancos o cheques, no es efectivo físico
      const esExterno =
        desc.includes('BANCO') ||
        desc.includes('CHEQUE') ||
        desc.includes('TRANSFERENCIA') ||
        desc.includes('BANCARIO')
      return esIngreso && !esExterno
    })
    .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)

  // 2. EGRESOS FÍSICOS (Lo que el cajero pagó en billetes)
  const totalEgresosEfectivo = movimientos
    .filter((m) => {
      const esEgreso = m.tipoMovimiento === 'Egreso'
      const desc = m.descripcion?.toUpperCase() || ''
      console.log(desc)

      // Filtro crítico: Ignoramos los $2,000 de "EGRESO BANCO" para el saldo físico
      const esExterno =
        desc.includes('BANCO') ||
        desc.includes('CHEQUE') ||
        desc.includes('TRANSFERENCIA') ||
        desc.includes('BANCARIO')
      const esContable = m.CajaId === null

      return esEgreso && !esExterno && !esContable
    })
    .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)

  // 3. MOVIMIENTOS VIRTUALES (Solo para mostrar información)
  const totalMovimientosVirtuales = movimientos
    .filter((m) => {
      const desc = m.descripcion?.toUpperCase() || ''
      return (
        desc.includes('BANCO') ||
        desc.includes('CHEQUE') ||
        desc.includes('TRANSFERENCIA') ||
        desc.includes('BANCARIO')
      )
    })
    .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)

  const saldoInicial = parseFloat(cajaActiva?.montoApertura || 0)

  const saldoEsperado = saldoInicial + totalIngresosEfectivo - totalEgresosEfectivo
  const diferenciaActual = useMemo(() => {
    if (!montoFisicoCierre) return 0

    const diff = parseFloat(montoFisicoCierre) - saldoEsperado

    // Forzamos el redondeo a 2 decimales para eliminar residuos infinitesimales
    return Number(diff.toFixed(2))
  }, [montoFisicoCierre, saldoEsperado])

  const handleVentaRapidaSubmit = async (e) => {
    e.preventDefault()
    if (infoVenta.cantARestar <= 0) return
    const prod = productos.find((p) => p.id === ventaData.ProductoId)
    const payload = {
      monto: parseFloat(infoVenta.totalDinero),
      descripcion: `VENTA; ${ventaData.cantidad} ${ventaData.unidadVenta} ${prod.nombre} - ${ventaData.descripcion}`,
      CajaId: cajaActiva.id,
      ProductoId: prod.id,
      cantidad: infoVenta.cantARestar,
    }

    const res = await ejecutarVentaRapida(payload)
    if (res.success) {
      setIsVentaModalOpen(false)
      setVentaData({
        ProductoId: '',
        cantidad: '',
        unidadVenta: 'Libras',
        precio: '',
        descripcion: '',
      })
      setCaja(res.data?.caja)
      Swal.fire('Éxito', 'Venta e Inventario actualizados', 'success')
    }
  }

  const handleAbrirCaja = async (e) => {
    e.preventDefault()
    if (!montoApertura || montoApertura < 0)
      return Swal.fire('Atención', 'Monto inválido', 'warning')

    setLoading(true)
    try {
      const data = { montoApertura: parseFloat(montoApertura), UsuarioId: user.id }
      const resp = await cajaAPI.abriCaja(token, data)
      setIsModalOpen(false)
      setMontoApertura('')
      setCaja(resp.data.caja)
      fetchCajas()
      Swal.fire({ icon: 'success', title: 'Caja Abierta', confirmButtonColor: '#000' })
    } catch (error) {
      console.log(error.message)
      Swal.fire('Error', 'No se pudo abrir la caja', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInyeccionBanco = async (e) => {
    e.preventDefault()
    const montoNum = parseFloat(montoBanco)
    if (isNaN(montoNum) || montoNum <= 0) return Swal.fire('Atención', 'Monto inválido', 'warning')
    if (!descBanco.trim()) return Swal.fire('Atención', 'Falta referencia', 'warning')

    setLoading(true)
    try {
      const data = {
        monto: montoNum,
        descripcion: `INYECCIÓN: ${descBanco}`.toUpperCase(),
        CajaId: cajaActiva.id,
      }
      const resp = await cajaAPI.registrarInyeccionBanco(token, data)
      if (resp.status === 201) {
        if (resp.data?.caja) setCaja(resp.data.caja)
        setIsBancoModalOpen(false)
        setMontoBanco('')
        setDescBanco('')
        fetchCajas()
        Swal.fire({
          icon: 'success',
          title: 'INGRESO EXITOSO',
          confirmButtonColor: '#000',
          timer: 2000,
        })
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo registrar la inyección', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrarCaja = async (e) => {
    e.preventDefault()

    if (diferenciaActual !== 0) {
      const result = await Swal.fire({
        title: '¿Confirmar con Diferencia?',
        html: `Hay un descuadre de <b>${formatMoney(diferenciaActual)}</b>.<br>Justifica la diferencia en observaciones.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar caja',
        confirmButtonColor: '#d33',
        didOpen: () => {
          Swal.getContainer().style.zIndex = '99999'
        },
      })
      if (!result.isConfirmed) return
    }

    setLoading(true)
    try {
      const payload = {
        montoCierre: parseFloat(montoFisicoCierre),
        observaciones:
          observacionesCierre || `Cierre Aroma Oro. Diferencia: ${formatMoney(diferenciaActual)}`,
      }

      const resp = await cajaAPI.cerrarCaja(cajaActiva.id, token, payload)
      const { resumen } = resp.data

      setIsClosingModal(false)

      setTimeout(() => {
        Swal.fire({
          icon: resumen.diferencia === 0 ? 'success' : 'warning',
          title: resumen.diferencia === 0 ? 'Caja Cuadrada' : 'Cierre con Diferencia',
          html: `
          <div class="text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 font-sans shadow-inner">
            <div class="flex justify-between text-xs mb-1 text-slate-500 uppercase font-black"><span>Esperado:</span> <span>${formatMoney(resumen.esperado)}</span></div>
            <div class="flex justify-between text-xs mb-1 text-slate-500 uppercase font-black"><span>Reportado:</span> <span>${formatMoney(resumen.contado)}</span></div>
            <div class="h-px bg-slate-200 my-2"></div>
            <div class="flex justify-between text-lg font-black ${resumen.diferencia < 0 ? 'text-rose-600' : 'text-emerald-600'}">
              <span>Diferencia:</span>
              <span>${formatMoney(resumen.diferencia)}</span>
            </div>
          </div>`,
          confirmButtonColor: '#0f172a',
          didOpen: () => {
            Swal.getContainer().style.zIndex = '99999'
          },
        })

        setMontoFisicoCierre('')
        setObservacionesCierre('')
        fetchCajas()
        setCaja(null)
      }, 150)
    } catch (error) {
      console.log(error.response.data.message || 'Error al cerrar')
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cerrar la caja' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4 text-gray-800">
        <CajasHeader
          cajaActiva={cajaActiva}
          setIsClosingModal={setIsClosingModal}
          setIsModalOpen={setIsModalOpen}
          setIsBancoModalOpen={setIsBancoModalOpen}
          setIsVentaModalOpen={setIsVentaModalOpen}
          user={user}
        />
        <div className="mt-6">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100 italic">
              <p className="text-gray-400 font-black uppercase text-xs animate-pulse tracking-widest">
                Sincronizando flujos Aroma de Oro...
              </p>
            </div>
          ) : error ? (
            /* --- NUEVO: VISTA DE ACCESO DENEGADO --- */
            <div className="flex flex-col items-center justify-center bg-white py-10 text-center rounded-2xl">
              <div className="bg-rose-50 p-4 rounded-3xl mb-4 border border-rose-100">
                <MdSecurity size={50} className="text-rose-400" />
              </div>
              <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
                Acceso Restringido
              </h3>
              <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto leading-relaxed">
                {error}
              </p>
              <span className="text-[8px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full mt-4 font-black uppercase italic">
                Seguridad Aroma de Oro
              </span>
            </div>
          ) : !cajas || cajas.length === 0 ? (
            /* --- VISTA DE CAJA VACÍA --- */
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <MdInfo size={32} />
              </div>
              <h3 className="text-gray-900 font-black uppercase tracking-widest text-sm">
                No hay registros de caja
              </h3>
              <p className="text-gray-500 text-xs mt-1 font-medium italic">
                Presiona "Abrir Caja" para iniciar un nuevo turno.
              </p>
            </div>
          ) : (
            /* --- VISTA DE TABLA (Pasamos el error por si acaso) --- */
            <CajasTable fetching={fetching} cajas={cajas} error={error} reabrirCaja={reabrirCaja} />
          )}
        </div>
      </div>

      <Modal
        isOpen={isVentaModalOpen}
        onClose={() => setIsVentaModalOpen(false)}
        title="Venta de Mostrador"
      >
        <form onSubmit={handleVentaRapidaSubmit} className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Producto
            </label>
            <select
              required
              className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-xs font-black uppercase outline-none focus:border-emerald-500 transition-all"
              value={ventaData.ProductoId}
              onChange={(e) => setVentaData({ ...ventaData, ProductoId: e.target.value })}
            >
              <option value="">-- Seleccionar --</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (Disp: {p.stock} {p.unidadMedida})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Cant.
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 font-mono font-black outline-none focus:border-emerald-500"
                value={ventaData.cantidad}
                onChange={(e) => setVentaData({ ...ventaData, cantidad: e.target.value })}
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Unidad
              </label>
              <select
                className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-2 text-[10px] font-black uppercase outline-none"
                value={ventaData.unidadVenta}
                onChange={(e) => setVentaData({ ...ventaData, unidadVenta: e.target.value })}
              >
                <option value="Libras">Libras</option>
                <option value="Kilogramos">Kilos</option>
              </select>
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                P. Unit
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 font-mono font-black outline-none focus:border-emerald-500"
                value={ventaData.precioUnitario}
                onChange={(e) => setVentaData({ ...ventaData, precioUnitario: e.target.value })}
              />
            </div>
          </div>

          {/* --- PANEL DE IMPACTO EN STOCK (LO QUE PEDISTE) --- */}
          {ventaData.ProductoId && ventaData.cantidad && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500">
                <MdInventory2 size={14} />
                <span className="text-[9px] font-black uppercase">Resumen de Inventario</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <span className="text-[8px] text-gray-400 uppercase block leading-tight">
                    Se restarán
                  </span>
                  <p className="text-sm font-black text-rose-500 font-mono">
                    -{infoVenta.cantARestar}{' '}
                    <span className="text-[9px]">{infoVenta.unidadBase}</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="text-center">
                  <span className="text-[8px] text-gray-400 uppercase block leading-tight">
                    Quedarán
                  </span>
                  <p
                    className={`text-sm font-black font-mono ${infoVenta.stockResultante < 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}
                  >
                    {infoVenta.stockResultante}{' '}
                    <span className="text-[9px]">{infoVenta.unidadBase}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-2xl p-5 flex justify-between items-center shadow-xl">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Total Cobrado
            </span>
            <span className="text-amber-400 text-3xl font-black font-mono italic">
              ${infoVenta.totalDinero}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !ventaData.ProductoId || infoVenta.stockResultante < 0}
            className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all ${infoVenta.stockResultante < 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}
          >
            {infoVenta.stockResultante < 0
              ? 'STOCK INSUFICIENTE'
              : loading
                ? 'PROCESANDO...'
                : 'REGISTRAR VENTA'}
          </button>
        </form>
      </Modal>

      {/* APERTURA */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apertura de Turno">
        <form onSubmit={handleAbrirCaja} className="p-4 space-y-6">
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Saldo Inicial
            </label>
            <div className="flex items-center h-20 bg-gray-50 rounded-2xl border-2 border-gray-100 px-6">
              <MdAttachMoney className="text-amber-500 text-3xl mr-2" />
              <input
                type="number"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                step="0.01"
                required
                className="bg-transparent w-full outline-none text-3xl font-black font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em]"
          >
            Abrir Caja
          </button>
        </form>
      </Modal>

      {/* BANCOS */}
      <Modal
        isOpen={isBancoModalOpen}
        onClose={() => setIsBancoModalOpen(false)}
        title="INGRESO DESDE BANCOS"
      >
        <form onSubmit={handleInyeccionBanco} className="px-2 py-4 space-y-5">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 flex items-center gap-3">
            <MdInfo className="text-amber-500" size={20} />
            <p className="text-[10px] text-amber-900 font-bold uppercase leading-tight">
              Inyección Bancaria:{' '}
              <span className="font-normal">Suma al saldo físico de la caja.</span>
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
              Monto
            </label>
            <div className="flex items-center h-14 bg-white border border-gray-200 rounded-lg px-4 shadow-sm">
              <span className="text-gray-400 font-bold text-xl mr-2">$</span>
              <input
                type="number"
                value={montoBanco}
                onChange={(e) => setMontoBanco(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
                className="bg-transparent w-full outline-none text-xl font-black font-mono"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
              Referencia
            </label>
            <textarea
              value={descBanco}
              onChange={(e) => setDescBanco(e.target.value)}
              placeholder="Detalle del ingreso..."
              rows="2"
              required
              className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none text-sm font-bold text-gray-700 resize-none shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !montoBanco}
            className="w-full py-4 bg-gray-900 text-white rounded-lg font-black uppercase text-[11px]"
          >
            CONFIRMAR INGRESO
          </button>
        </form>
      </Modal>

      {/* CIERRE (ARQUEO CORREGIDO) */}
      <Modal
        isOpen={isClosingModal}
        onClose={() => setIsClosingModal(false)}
        title="Arqueo Aroma de Oro"
      >
        <form onSubmit={handleCerrarCaja} className="p-4 space-y-6">
          <div className="bg-[#0f172a] rounded-[2rem] p-6 text-white shadow-2xl relative border border-white/5">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-gray-400">
                    Fondo Inicial
                  </span>
                  <p className="text-2xl font-black font-mono">{formatMoney(saldoInicial)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[9px] font-black uppercase text-amber-500">
                    Saldo Esperado (Físico)
                  </span>
                  <p className="text-2xl font-black font-mono text-amber-400">
                    {formatMoney(saldoEsperado)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <MdTrendingUp size={16} />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black text-gray-500 uppercase">
                      Ingresos Caja
                    </span>
                    <p className="text-md font-black font-mono text-emerald-400">
                      +{formatMoney(totalIngresosEfectivo)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end text-right">
                  <div>
                    <span className="block text-[8px] font-black text-gray-500 uppercase">
                      Egresos Caja
                    </span>
                    <p className="text-md font-black font-mono text-rose-400">
                      -{formatMoney(totalEgresosEfectivo)}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <MdTrendingDown size={16} />
                  </div>
                </div>
              </div>

              {/* Informativo para bancos/cheques */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2 text-blue-400">
                  <MdAccountBalance size={14} />
                  <span className="text-[8px] font-black uppercase">
                    Operaciones Bancarias/Cheques
                  </span>
                </div>
                <p className="text-sm font-black font-mono text-blue-300">
                  {formatMoney(totalMovimientosVirtuales)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase">
              Dinero Real en Mano
            </label>
            <div className="flex items-center h-20 bg-white rounded-3xl border-4 border-gray-100 focus-within:border-gray-900 px-8 shadow-xl">
              <MdAttachMoney className="text-gray-300 text-3xl mr-2" />
              <input
                type="number"
                value={montoFisicoCierre}
                onChange={(e) => setMontoFisicoCierre(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
                className="bg-transparent w-full outline-none text-2xl font-black text-gray-900 font-mono"
              />
            </div>
            {montoFisicoCierre && (
              <div
                className={`px-4 py-2 rounded-xl text-center text-xs font-black border ${diferenciaActual === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
              >
                DIFERENCIA: {formatMoney(diferenciaActual)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase">
              Notas de Cierre
            </label>
            <textarea
              value={observacionesCierre}
              onChange={(e) => setObservacionesCierre(e.target.value)}
              placeholder="Justificación en caso de descuadre..."
              rows="2"
              className="w-full bg-white border-4 border-gray-100 rounded-3xl py-4 px-6 outline-none font-bold text-gray-700 shadow-xl resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl transition-all ${diferenciaActual === 0 && montoFisicoCierre ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white'}`}
          >
            {loading ? 'Procesando...' : 'Cerrar Turno'}
          </button>
        </form>
      </Modal>
    </Container>
  )
}

export default Cajas
