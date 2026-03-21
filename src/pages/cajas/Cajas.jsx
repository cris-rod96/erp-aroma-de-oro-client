import { useState } from 'react'
import { CajasHeader, CajasTable, Container, Modal } from '../../components/index.components'
import {
  MdAttachMoney,
  MdWarningAmber,
  MdDescription,
  MdTrendingUp,
  MdTrendingDown,
  MdInfo,
} from 'react-icons/md'
import cajaAPI from '../../api/caja/caja.api'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { useCajas } from '../../hooks/useCajas'
import { formatMoney } from '../../utils/fromatters'

const Cajas = () => {
  const token = useAuthStore((state) => state.token)
  const setCaja = useCajaStore((state) => state.setCaja)
  const user = useAuthStore((store) => store.adminData)
  const [observacionesCierre, setObservacionesCierre] = useState('')

  const [isBancoModalOpen, setIsBancoModalOpen] = useState(false)
  const [montoBanco, setMontoBanco] = useState('')
  const [descBanco, setDescBanco] = useState('')

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
  } = useCajas(token)

  // --- LÓGICA DE AUDITORÍA PRE-CIERRE ---
  const movimientos = cajaActiva?.Movimientos || []

  const totalIngresos = movimientos
    .filter((m) => m.tipoMovimiento === 'Ingreso')
    .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)

  const totalEgresos = movimientos
    .filter((m) => m.tipoMovimiento === 'Egreso')
    .reduce((acc, curr) => acc + parseFloat(curr.monto), 0)

  const saldoInicial = parseFloat(cajaActiva?.montoApertura || 0)
  const saldoEsperado = saldoInicial + totalIngresos - totalEgresos
  const diferenciaActual = montoFisicoCierre ? parseFloat(montoFisicoCierre) - saldoEsperado : 0

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
      Swal.fire('Error', 'No se pudo abrir la caja', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInyeccionBanco = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { monto: parseFloat(montoBanco), descripcion: descBanco, CajaId: cajaActiva.id }
      await cajaAPI.registrarInyeccionBanco(token, data)
      setIsBancoModalOpen(false)
      setMontoBanco('')
      setDescBanco('')
      fetchCajas()
      Swal.fire({ icon: 'success', title: 'Ingreso Registrado' })
    } catch (error) {
      Swal.fire('Error', 'Error al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrarCaja = async (e) => {
    e.preventDefault()

    // 1. SI HAY DIFERENCIA: Forzamos al alert a estar por encima de todo
    if (diferenciaActual !== 0) {
      const result = await Swal.fire({
        title: '¿Confirmar con Diferencia?',
        html: `Hay un descuadre de <b>${formatMoney(diferenciaActual)}</b>.<br>Por favor, justifica la diferencia en las observaciones.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar con descuadre',
        cancelButtonText: 'Revisar de nuevo',
        confirmButtonColor: '#d33',
        // FIX: Forzamos un z-index absurdamente alto para que el modal no lo tape
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
          observacionesCierre || `Cierre normal. Diferencia: ${formatMoney(diferenciaActual)}`,
      }

      const resp = await cajaAPI.cerrarCaja(cajaActiva.id, token, payload)
      const { resumen } = resp.data

      // 2. Aquí sí, cerramos el modal antes del alert de éxito final
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
          // También aquí por seguridad
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
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Error Crítico',
        text: 'No se pudo sincronizar el cierre',
        didOpen: () => {
          Swal.getContainer().style.zIndex = '99999'
        },
      })
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
          user={user}
        />
        <CajasTable fetching={fetching} cajas={cajas} />
      </div>

      {/* MODAL 1: APERTURA */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apertura de Turno">
        <form onSubmit={handleAbrirCaja} className="p-4 space-y-6">
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Saldo Inicial en Efectivo
            </label>
            <div className="flex items-center h-20 bg-gray-50 rounded-2xl border-2 border-gray-100 focus-within:border-amber-400 px-6">
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

      {/* MODAL 2: BANCOS */}
      <Modal
        isOpen={isBancoModalOpen}
        onClose={() => setIsBancoModalOpen(false)}
        title="Ingreso desde Bancos"
      >
        <form onSubmit={handleInyeccionBanco} className="p-4 space-y-4">
          {/* Contenido banco omitido por brevedad según código previo */}
        </form>
      </Modal>

      {/* MODAL 3: CIERRE DETALLADO */}
      <Modal
        isOpen={isClosingModal}
        onClose={() => setIsClosingModal(false)}
        title="Arqueo Detallado de Turno"
      >
        {/* Eliminado max-h y overflow para evitar doble scroll */}
        <form onSubmit={handleCerrarCaja} className="p-4 space-y-6">
          <div className="bg-[#0f172a] rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden border border-white/5">
            <div className="relative z-10">
              <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.3em] mb-6 text-center">
                Auditoría de Flujo de Caja
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Fondo Inicial
                      </span>
                    </div>
                    <p className="text-2xl font-black font-mono leading-none tracking-tighter">
                      {formatMoney(saldoInicial)}
                    </p>
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 text-amber-400 justify-end">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                        Saldo Esperado
                      </span>
                    </div>
                    <p className="text-2xl font-black font-mono leading-none text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                      {formatMoney(saldoEsperado)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <MdTrendingUp size={20} />
                    </div>
                    <div>
                      <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">
                        Ingresos Totales
                      </span>
                      <p className="text-lg font-black font-mono text-emerald-400 leading-none mt-1">
                        +{formatMoney(totalIngresos)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-end text-right">
                    <div>
                      <span className="block text-[8px] font-black text-gray-500 uppercase tracking-widest">
                        Egresos Totales
                      </span>
                      <p className="text-lg font-black font-mono text-rose-400 leading-none mt-1">
                        -{formatMoney(totalEgresos)}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                      <MdTrendingDown size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* DINERO REAL EN MANO - TAMAÑO CORREGIDO */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Dinero Real en Mano
              </label>
              {montoFisicoCierre && (
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${diferenciaActual === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
                >
                  Diferencia: {formatMoney(diferenciaActual)}
                </div>
              )}
            </div>

            <div className="flex items-center h-20 bg-white rounded-3xl border-4 border-gray-100 focus-within:border-gray-900 px-8 transition-all shadow-xl shadow-gray-100">
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
          </div>

          {/* OBSERVACIONES */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
              Justificación / Notas
            </label>
            <div className="relative group">
              <div className="absolute top-4 left-5 text-gray-300 group-focus-within:text-gray-900 transition-colors">
                <MdDescription size={20} />
              </div>
              <textarea
                value={observacionesCierre}
                onChange={(e) => setObservacionesCierre(e.target.value)}
                placeholder="Escribe aquí si hubo algún descuadre o nota del turno..."
                rows="3"
                className="w-full bg-white border-4 border-gray-100 rounded-3xl py-4 pl-14 pr-6 outline-none focus:border-gray-900 transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300 shadow-xl shadow-gray-100 resize-none"
              />
            </div>
          </div>

          {diferenciaActual !== 0 && montoFisicoCierre !== '' && (
            <div className="bg-rose-50 border-2 border-rose-100 p-5 rounded-2xl flex items-center gap-4 animate-pulse">
              <div className="bg-rose-500 p-2 rounded-lg text-white">
                <MdWarningAmber size={24} />
              </div>
              <p className="text-[10px] text-rose-800 font-black uppercase leading-tight tracking-tight">
                El sistema detectó un descuadre. <br />
                <span className="text-[12px]">
                  Se informará un {diferenciaActual > 0 ? 'SOBRANTE' : 'FALTANTE'} al administrador.
                </span>
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-6 rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${
                diferenciaActual === 0 && montoFisicoCierre
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-gray-900 text-white shadow-gray-300'
              }`}
            >
              {loading ? 'Procesando Auditoría...' : 'Cerrar Turno Definitivamente'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Cajas
