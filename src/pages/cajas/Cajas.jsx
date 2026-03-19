import { CajasHeader, CajasTable, Container, Modal } from '../../components/index.components'
import { MdAttachMoney, MdWarningAmber } from 'react-icons/md'
import cajaAPI from '../../api/caja/caja.api'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { useCajas } from '../../hooks/useCajas'

const Cajas = () => {
  const token = useAuthStore((state) => state.token)
  const setCaja = useCajaStore((state) => state.setCaja)
  const user = useAuthStore((store) => store.adminData)

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
      setCaja(resp.data.caja)
      fetchCajas()
      Swal.fire({
        icon: 'success',
        title: 'Caja Abierta',
        confirmButtonColor: '#000',
      })
    } catch (error) {
      console.error(error)

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
      console.error(error)
      Swal.fire('Error', 'No se pudo cerrar la caja', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4 text-gray-800">
        {/* ENCABEZADO */}
        <CajasHeader
          cajaActiva={cajaActiva}
          setIsClosingModal={setIsClosingModal}
          setIsModalOpen={setIsModalOpen}
        />

        {/* TABLA DE HISTORIAL CON COLUMNA DE DIFERENCIA */}
        <CajasTable fetching={fetching} cajas={cajas} />
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
