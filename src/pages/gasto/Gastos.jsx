import { useState, useEffect, useCallback } from 'react'
import {
  FaPlus,
  FaGasPump,
  FaUtensils,
  FaTools,
  FaShoppingCart,
  FaBoxes,
  FaPrint,
  FaSearch,
  FaMoneyBillWave,
  FaCheckCircle,
} from 'react-icons/fa'
import { MdAttachMoney, MdDescription } from 'react-icons/md'
import { Container, Modal } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { gastoAPI } from '../../api/index.api'
import Swal from 'sweetalert2'

const Gastos = () => {
  const [fetching, setFetching] = useState(true)
  const [gastos, setGastos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.data)
  const { caja, setCaja } = useCajaStore()

  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    categoria: 'Varios',
  })

  const categorias = [
    { nombre: 'Alimentación', icono: <FaUtensils /> },
    { nombre: 'Repuestos', icono: <FaTools /> },
    { nombre: 'Combustible', icono: <FaGasPump /> },
    { nombre: 'Mantenimiento', icono: <FaTools /> },
    { nombre: 'Suministros', icono: <FaShoppingCart /> },
    { nombre: 'Varios', icono: <FaBoxes /> },
  ]

  const fetchGastos = useCallback(async () => {
    try {
      setFetching(true)
      const res = await gastoAPI.listarGastos(token)
      // Aseguramos que gastos sea un array
      setGastos(res.data.gastos || res.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setFetching(false)
    }
  }, [token])

  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])

  const handleOpenModal = () => {
    if (!caja || caja.estado !== 'Abierta') {
      return Swal.fire(
        'Caja Cerrada',
        'Debes tener una caja abierta para registrar gastos',
        'warning'
      )
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (parseFloat(formData.monto) > parseFloat(caja?.saldoActual)) {
      return Swal.fire('Error', 'Saldo insuficiente en caja', 'error')
    }

    setLoading(true)
    try {
      const res = await gastoAPI.crearGasto(token, {
        ...formData,
        CajaId: caja.id,
        UsuarioId: user.id,
      })
      if (res.status === 201) {
        Swal.fire('Éxito', `Gasto registrado correctamente`, 'success')
        if (res.data.caja) setCaja(res.data.caja)
        setIsModalOpen(false)
        setFormData({ monto: '', descripcion: '', categoria: 'Varios' })
        fetchGastos()
      }
    } catch (error) {
      console.log(error)
      Swal.fire('Error', error.response?.data?.message || 'Error al registrar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = gastos.filter(
    (g) =>
      g.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Container fullWidth>
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-2xl font-black uppercase italic text-gray-900">Gastos Generales</h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
              Aroma de Oro - Operaciones
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="bg-gray-900 text-amber-400 px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 active:scale-95 transition-transform"
          >
            <FaPlus /> Registrar Gasto
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="mb-6 relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="BUSCAR GASTO..."
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 text-[11px] font-bold uppercase outline-none focus:border-amber-400 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              <tr>
                <th className="p-5">Código / Fecha</th>
                <th className="p-5">Descripción</th>
                <th className="p-5 text-center">Categoría</th>
                <th className="p-5 text-right">Monto</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px] font-bold text-gray-700 uppercase">
              {fetching ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                    Cargando datos...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 text-gray-900 font-black">
                      {g.codigo}
                      <br />
                      <span className="text-[9px] text-gray-400 font-normal">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-5 max-w-xs truncate">{g.descripcion}</td>
                    <td className="p-5 text-center">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-black">
                        {g.categoria}
                      </span>
                    </td>
                    <td className="p-5 text-right text-red-600 font-black">
                      ${parseFloat(g.monto).toFixed(2)}
                    </td>
                    <td className="p-5 text-center">
                      <button className="p-2 bg-gray-900 text-amber-400 rounded-lg hover:scale-110 transition-transform">
                        <FaPrint />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <FaBoxes size={40} className="mb-2 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        No hay gastos registrados
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (Asegúrate que use isOpen o show según tu componente) */}
      <Modal
        isOpen={isModalOpen}
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="REGISTRAR NUEVO GASTO"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SALDO CAJA */}
          <div className="bg-gray-950 p-5 rounded-2xl flex items-center justify-between border-b-4 border-amber-400 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 p-2 rounded-lg text-amber-950">
                <FaMoneyBillWave size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                  Saldo disponible
                </p>
                <p className="text-xl font-black text-white italic">
                  ${parseFloat(caja?.saldoActual || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Monto ($)</label>
            <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus-within:border-amber-400 transition-all">
              <MdAttachMoney className="text-emerald-500" size={20} />
              <input
                type="number"
                step="0.01"
                required
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="bg-transparent w-full outline-none font-black text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Categoría</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar border border-gray-50 p-2 rounded-xl">
              {categorias.map((cat) => (
                <div
                  key={cat.nombre}
                  onClick={() => setFormData({ ...formData, categoria: cat.nombre })}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border-2 transition-all ${
                    formData.categoria === cat.nombre
                      ? 'bg-amber-400 border-amber-400 text-amber-950 shadow-md'
                      : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        formData.categoria === cat.nombre ? 'text-amber-950' : 'text-amber-500'
                      }
                    >
                      {cat.icono}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {cat.nombre}
                    </span>
                  </div>
                  {formData.categoria === cat.nombre && <FaCheckCircle size={14} />}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-red-500 uppercase ml-1 tracking-tighter">
              Justificación Obligatoria
            </label>
            <div className="flex bg-white border-2 border-red-100 rounded-xl p-4 focus-within:border-red-400 transition-all">
              <MdDescription className="text-red-400 mr-3 mt-1" size={20} />
              <textarea
                required
                minLength={5}
                rows={2}
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none font-bold text-xs text-red-900 uppercase resize-none placeholder:text-red-200"
                placeholder="EJ: ALMUERZOS PARA PERSONAL DE SECADO..."
              />
            </div>
          </div>

          <div className="bg-gray-950 p-6 rounded-3xl flex items-center justify-between shadow-2xl">
            <div className="text-white text-left">
              <p className="text-[9px] font-black text-gray-500 uppercase italic">A egresar</p>
              <p className="text-3xl font-black italic font-mono text-amber-400">
                ${parseFloat(formData.monto || 0).toFixed(2)}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.monto}
              className="bg-amber-400 text-amber-950 px-8 py-4 rounded-xl font-black uppercase text-[11px] shadow-lg active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 transition-all"
            >
              {loading ? 'Confirmando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Gastos
