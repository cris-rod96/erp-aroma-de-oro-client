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
} from 'react-icons/md'
import cajaAPI from '../../api/caja/caja.api'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'

const Cajas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cajas, setCajas] = useState([])
  const [montoApertura, setMontoApertura] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const token = useAuthStore((state) => state.token)
  const setCaja = useCajaStore((state) => state.setCaja)

  // --- FUNCIONES DE FORMATO ---

  // Formato legible sin cursivas y con fuente clara
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
      // Usamos resp.data.cajas según tu backend
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

  // Detectar caja activa basándonos en tu estado "Abierta"
  const cajaActiva = useMemo(() => {
    return cajas.find((c) => c.estado === 'Abierta')
  }, [cajas])

  const handleAbrirCaja = async (e) => {
    e.preventDefault()
    if (!montoApertura || montoApertura < 0)
      return Swal.fire('Atención', 'Ingresa un monto válido', 'warning')

    setLoading(true)
    try {
      const data = { montoApertura: parseFloat(montoApertura) }
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
        text: '¡Listos para operar!',
        confirmButtonColor: '#000',
      })
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo abrir la caja', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCerrarCaja = async (id) => {
    console.log(id)
    const confirm = await Swal.fire({
      title: '¿Cerrar esta caja?',
      text: 'Se registrará el cierre con el flujo actual del sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b48c36',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
    })

    if (confirm.isConfirmed) {
      try {
        await cajaAPI.cerrarCaja(id, token)
        fetchCajas()
        Swal.fire('Éxito', 'La caja se cerró correctamente', 'success')
      } catch (error) {
        Swal.fire('Error', 'No se pudo cerrar la caja', 'error')
      }
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
                onClick={() => handleCerrarCaja(cajaActiva.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <MdAccessTime size={18} /> Cerrar Turno Actual
              </button>
            )}

            <button
              disabled={!!cajaActiva}
              onClick={() => setIsModalOpen(true)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                cajaActiva
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gray-900 hover:bg-gray-800 text-amber-400'
              }`}
            >
              <MdAccountBalanceWallet size={18} />
              {cajaActiva ? 'Caja en uso' : 'Nueva Apertura'}
            </button>
          </div>
        </div>

        {/* BANNER CAJA ACTIVA */}
        {cajaActiva && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="bg-amber-400 p-3 rounded-xl text-white">
              <MdInfoOutline size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                Aviso de Operación
              </p>
              <p className="text-sm text-amber-900 font-bold">
                Caja abierta hoy:{' '}
                <span className="font-mono">{formatFecha(cajaActiva.fechaApertura)}</span> con{' '}
                <span className="font-black">{formatMoney(cajaActiva.montoApertura)}</span>.
              </p>
            </div>
          </div>
        )}

        {/* TABLA REESTRUCTURADA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    N°
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Apertura
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Cierre
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Fondo Inicial
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Monto Final
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fetching ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-20 text-center animate-pulse font-black text-gray-300 uppercase text-xs"
                    >
                      Sincronizando...
                    </td>
                  </tr>
                ) : cajas.length > 0 ? (
                  cajas.map((caja, index) => (
                    <tr key={caja.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-black text-gray-400 text-xs">#{index + 1}</td>
                      <td className="px-6 py-4 text-[12px] font-bold text-gray-700 font-mono">
                        {formatFecha(caja.fechaApertura)}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-bold text-gray-700 font-mono">
                        {formatFecha(caja.fechaCierre)}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-black text-gray-900">
                        {formatMoney(caja.montoApertura)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-amber-600">
                        {formatMoney(caja.montoCierre)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            caja.estado === 'Abierta'
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}
                        >
                          {caja.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        {caja.estado === 'Abierta' && (
                          <button
                            onClick={() => handleCerrarCaja(caja.id)}
                            className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-red-700 transition-all shadow-sm"
                          >
                            Cerrar
                          </button>
                        )}
                        <NavLink className="text-gray-400 hover:text-gray-900 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest transition-colors">
                          Detalle <MdArrowForward />
                        </NavLink>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
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

      {/* MODAL APERTURA */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apertura de Caja">
        <form onSubmit={handleAbrirCaja} className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Saldo Inicial (USD)
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
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl"
            >
              {loading ? 'Procesando...' : 'Iniciar Turno'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Cajas
