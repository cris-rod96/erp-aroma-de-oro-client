import { useState, useEffect, useMemo } from 'react'
import { Container, Modal } from '../../components/index.components'
import { NavLink } from 'react-router-dom'
import {
  MdAccountBalanceWallet,
  MdAccessTime,
  MdArrowForward,
  MdAttachMoney,
  MdInfoOutline,
  MdInbox,
  MdWarningAmber,
} from 'react-icons/md'
import cajaAPI from '../../api/caja/caja.api'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'

const Cajas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClosingModal, setIsClosingModal] = useState(false) // Nuevo Modal para Arqueo
  const [cajas, setCajas] = useState([])
  const [montoApertura, setMontoApertura] = useState('')
  const [montoFisicoCierre, setMontoFisicoCierre] = useState('') // Estado para el monto de cierre
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const token = useAuthStore((state) => state.token)
  const setCaja = useCajaStore((state) => state.setCaja)
  const user = useAuthStore((store) => store.adminData)

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return '---'
    const date = new Date(fechaISO)
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  const formatMoney = (valor) => {
    const numero = parseFloat(valor) || 0
    return numero.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  const fetchCajas = async () => {
    setFetching(true)
    try {
      const resp = await cajaAPI.listarTodas(token)
      setCajas(resp.data.cajas || [])
    } catch (error) {
      console.error('Error al listar cajas', error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchCajas()
  }, [])

  const cajaActiva = useMemo(() => {
    return cajas.find((c) => c.estado === 'Abierta')
  }, [cajas])

  const handleAbrirCaja = async (e) => {
    e.preventDefault()
    if (!montoApertura || montoApertura < 0)
      return Swal.fire('Atención', 'Ingresa un monto válido', 'warning')

    setLoading(true)
    try {
      const data = {
        montoApertura: parseFloat(montoApertura),
        UsuarioId: user.id,
      }
      const resp = await cajaAPI.abriCaja(token, data)

      setIsModalOpen(false)
      setMontoApertura('')
      setCaja({
        caja: resp.data.caja,
        isCajaAbierta: true,
      })
      fetchCajas()
      Swal.fire({
        icon: 'success',
        title: 'Caja Abierta',
        confirmButtonColor: '#000',
      })
    } catch (error) {
      Swal.fire('Error', 'No se pudo abrir la caja', 'error')
    } finally {
      setLoading(false)
    }
  }

  // FUNCIÓN PARA EL CIERRE CON ARQUEO
  const handleCerrarCaja = async (e) => {
    e.preventDefault()
    if (!montoFisicoCierre || montoFisicoCierre < 0) return

    setLoading(true)
    try {
      // Enviamos el monto físico contado por el cajero al backend
      await cajaAPI.cerrarCaja(cajaActiva.id, token, {
        montoCierre: parseFloat(montoFisicoCierre),
      })

      setIsClosingModal(false)
      setMontoFisicoCierre('')
      fetchCajas()

      Swal.fire({
        icon: 'success',
        title: 'Turno Finalizado',
        text: 'El arqueo ha sido registrado en el historial.',
        confirmButtonColor: '#b48c36',
      })
    } catch (error) {
      Swal.fire('Error', 'No se pudo cerrar la caja', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4 text-gray-800">
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">
              Control de Cajas
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Aroma de Oro | Gestión de Turnos
            </p>
          </div>

          <div className="flex gap-3">
            {cajaActiva && (
              <button
                onClick={() => setIsClosingModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
              >
                <MdAccessTime size={18} /> Cerrar Turno
              </button>
            )}

            <button
              disabled={!!cajaActiva}
              onClick={() => setIsModalOpen(true)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                cajaActiva ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-amber-400'
              }`}
            >
              <MdAccountBalanceWallet size={18} />
              {cajaActiva ? 'Caja en uso' : 'Nueva Apertura'}
            </button>
          </div>
        </div>

        {cajaActiva && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="bg-amber-400 p-3 rounded-2xl text-white shadow-lg shadow-amber-200">
                <MdInfoOutline size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] leading-none mb-1">
                  Operación en Curso
                </p>
                <p className="text-sm text-amber-900 font-bold">
                  Caja abierta por <span className="text-amber-600">Admin</span> hoy a las{' '}
                  <span className="font-mono bg-amber-100 px-2 py-0.5 rounded-lg">
                    {formatFecha(cajaActiva.fechaApertura)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 px-6 border-l-2 border-amber-200/50">
              <div className="text-center">
                <p className="text-[9px] font-black text-amber-600 uppercase">Fondo Inicial</p>
                <p className="text-lg font-black text-gray-800">
                  {formatMoney(cajaActiva.montoApertura)}
                </p>
              </div>
              <div className="h-8 w-[1px] bg-amber-200"></div>
              <div className="text-center">
                <p className="text-[9px] font-black text-amber-600 uppercase">Estado</p>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs uppercase">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Abierta
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABLA DE HISTORIAL CON COLUMNA DE DIFERENCIA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4 text-left">Apertura / N°</th>
                  <th className="px-6 py-4 text-right">Fondo Inicial</th>
                  <th className="px-6 py-4 text-right">Monto Cierre</th>
                  <th className="px-6 py-4 text-right bg-gray-200/50">Diferencia</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fetching ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-20 text-center animate-pulse font-black text-gray-300 uppercase text-xs"
                    >
                      Cargando datos...
                    </td>
                  </tr>
                ) : cajas.length > 0 ? (
                  cajas.map((caja, index) => (
                    <tr key={caja.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-gray-400 text-[10px]">
                          #{cajas.length - index}
                        </div>
                        <div className="text-[12px] font-bold text-gray-700 font-mono">
                          {formatFecha(caja.fechaApertura)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-black text-gray-900">
                        {formatMoney(caja.montoApertura)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-gray-800">
                        {caja.estado === 'Abierta' ? '---' : formatMoney(caja.montoCierre)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm font-black ${
                          !caja.diferencia || parseFloat(caja.diferencia) === 0
                            ? 'text-gray-400'
                            : parseFloat(caja.diferencia) > 0
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                        }`}
                      >
                        {caja.estado === 'Abierta' ? 'En curso' : formatMoney(caja.diferencia)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            caja.estado === 'Abierta'
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                        >
                          {caja.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <NavLink className="text-amber-600 hover:text-amber-900 text-[10px] font-black flex items-center justify-end gap-1 uppercase tracking-widest transition-colors italic">
                          Detalle <MdArrowForward />
                        </NavLink>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <MdInbox size={48} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-gray-500 font-black uppercase text-xs">Sin registros</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL APERTURA (Mismo tuyo) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Apertura">
        <form onSubmit={handleAbrirCaja} className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Saldo Inicial (Fondo de Caja)
            </label>
            <div className="flex items-center h-16 bg-gray-50 rounded-2xl border-2 border-gray-100 focus-within:border-amber-400 px-6 transition-all">
              <MdAttachMoney className="text-amber-500 text-2xl mr-2" />
              <input
                type="number"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
                className="bg-transparent w-full outline-none text-2xl font-black text-gray-800 font-mono"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl"
          >
            {loading ? 'Procesando...' : 'Abrir Caja'}
          </button>
        </form>
      </Modal>

      {/* MODAL DE CIERRE (CON ARQUEO) */}
      <Modal
        isOpen={isClosingModal}
        onClose={() => setIsClosingModal(false)}
        title="Arqueo de Caja"
      >
        <form onSubmit={handleCerrarCaja} className="p-4 space-y-6">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
            <MdWarningAmber className="text-rose-500 shrink-0" size={20} />
            <p className="text-[11px] text-rose-800 font-bold leading-tight uppercase">
              Ingresa el dinero físico total que tienes en mano. El sistema lo comparará con los
              movimientos registrados.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Monto Físico Contado (USD)
            </label>
            <div className="flex items-center h-16 bg-gray-50 rounded-2xl border-2 border-gray-100 focus-within:border-rose-400 px-6 transition-all">
              <MdAttachMoney className="text-rose-500 text-2xl mr-2" />
              <input
                type="number"
                value={montoFisicoCierre}
                onChange={(e) => setMontoFisicoCierre(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
                className="bg-transparent w-full outline-none text-2xl font-black text-gray-800 font-mono"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsClosingModal(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-red-700 transition-all"
            >
              {loading ? 'Cerrando...' : 'Finalizar Turno'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Cajas
