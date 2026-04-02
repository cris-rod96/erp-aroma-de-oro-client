import { useState, useEffect } from 'react'
import {
  FaPlus,
  FaBoxes,
  FaPrint,
  FaSearch,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import {
  MdAttachMoney,
  MdCategory,
  MdOutlineAccountBalanceWallet,
  MdSecurity,
} from 'react-icons/md'
import { Container, Modal } from '../../components/index.components'
import { useGastos } from '../../hooks/useGastos'

const Gastos = () => {
  const {
    loading,
    handleSubmit,
    error,
    fetching,
    categorias,
    formData,
    filtered,
    isModalOpen,
    setIsModalOpen,
    setSearchTerm,
    handleOpenModal,
    searchTerm,
    caja,
    setFormData,
    empresa,
  } = useGastos()

  // --- LÓGICA DE ESTADO DE CAJA ---
  const tieneCajaAbierta = !!caja && !!caja.id
  const saldoActualCaja = parseFloat(caja?.saldoActual || 0)
  const montoIngresado = parseFloat(formData.monto || 0)
  const saldoInsuficiente = montoIngresado > saldoActualCaja

  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtered.length])

  return (
    <Container fullWidth>
      {/* ESTILOS INLINE PARA EL SCROLL DE CATEGORÍAS */}
      <style>{`
        .categorias-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .categorias-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .categorias-scroll::-webkit-scrollbar-thumb {
          background: #fbbf24;
          border-radius: 10px;
        }
        .categorias-scroll::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      `}</style>

      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER Y SALDO */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter leading-none ">
              Gastos Generales
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              {empresa?.nombre || 'Aroma de Oro'} | Flujo de Caja
            </p>
          </div>

          <div
            className={`flex items-center gap-5 p-2 pr-6 rounded-[2rem] border transition-all shadow-sm self-center ${
              tieneCajaAbierta ? 'bg-white border-gray-100' : 'bg-rose-50 border-rose-100'
            }`}
          >
            <div
              className={`p-3.5 rounded-[1.5rem] ${
                tieneCajaAbierta
                  ? 'bg-gray-900 text-amber-400 shadow-lg shadow-amber-400/20'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              <MdOutlineAccountBalanceWallet size={20} />
            </div>
            <div className="flex flex-col justify-center border-r border-gray-100 pr-5">
              <p
                className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${
                  tieneCajaAbierta ? 'text-gray-400' : 'text-rose-400'
                }`}
              >
                {tieneCajaAbierta ? 'Saldo en Caja' : 'Caja Cerrada'}
              </p>
              <p
                className={`text-xl font-black font-mono tracking-tighter leading-none ${
                  tieneCajaAbierta ? 'text-gray-900' : 'text-rose-600'
                }`}
              >
                ${saldoActualCaja.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {!error && (
              <button
                onClick={handleOpenModal}
                disabled={!tieneCajaAbierta}
                className={`h-10 px-6 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  tieneCajaAbierta
                    ? 'bg-gray-900 text-amber-400 hover:bg-gray-800 shadow-md shadow-gray-400/30'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaPlus size={10} /> Nuevo Gasto
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center bg-white py-10 text-center rounded-[2.5rem] shadow-xl border border-rose-100">
            <div className="bg-rose-50 p-6 rounded-[2rem] mb-4 border border-rose-100">
              <MdSecurity size={50} className="text-rose-400" />
            </div>
            <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
              Acceso Restringido
            </h3>
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto">
              {error}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative max-w-md group">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="BUSCAR GASTO POR DESCRIPCIÓN..."
                className="w-full bg-white border border-gray-100 rounded-[1.2rem] py-4 pl-14 pr-6 text-[10px] font-black uppercase outline-none focus:border-amber-400 shadow-sm transition-all tracking-widest placeholder:text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[550px]">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Código / Fecha</th>
                      <th className="px-8 py-6">Descripción / Concepto</th>
                      <th className="px-8 py-6 text-center">Categoría</th>
                      <th className="px-8 py-6 text-right">Monto</th>
                      <th className="px-8 py-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fetching ? (
                      <tr>
                        <td colSpan="5" className="p-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                              Sincronizando...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.length > 0 ? (
                      currentItems.map((g) => (
                        <tr key={g.id} className="hover:bg-amber-50/20 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                              {g.codigo}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold mt-1">
                              {new Date(g.createdAt).toLocaleDateString('es-EC')}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs font-bold text-gray-600 uppercase italic max-w-xs truncate">
                              {g.descripcion}
                            </p>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-200">
                              {g.categoria}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right font-mono font-black text-rose-600 text-base">
                            -${parseFloat(g.monto).toFixed(2)}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 transition-all shadow-md active:scale-95 border border-gray-700">
                              <FaPrint size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-24 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-200">
                            <FaBoxes size={80} className="mb-4 opacity-10" />
                            <p className="text-[11px] font-black uppercase tracking-[0.4em]">
                              No hay registros
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Página <span className="text-gray-900">{currentPage}</span> de{' '}
                  <span className="text-gray-900">{totalPages || 1}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-20 hover:border-amber-400 transition-all"
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white disabled:opacity-20 hover:border-amber-400 transition-all"
                  >
                    <FaChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE REGISTRO */}
      <Modal
        isOpen={isModalOpen}
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="REGISTRO DE EGRESO OPERATIVO"
      >
        <form onSubmit={handleSubmit} className="p-2 space-y-8">
          <div
            className={`p-6 rounded-[2rem] flex items-center justify-between border-b-4 shadow-2xl relative overflow-hidden group transition-colors ${
              saldoInsuficiente ? 'bg-rose-900 border-rose-500' : 'bg-gray-900 border-amber-500'
            }`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaMoneyBillWave size={80} className="text-white" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div
                className={`${saldoInsuficiente ? 'bg-rose-500 text-rose-950 shadow-rose-500/20' : 'bg-amber-400 text-amber-950 shadow-amber-400/20'} p-3 rounded-2xl shadow-lg`}
              >
                <FaMoneyBillWave size={22} />
              </div>
              <div>
                <p
                  className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${saldoInsuficiente ? 'text-rose-300' : 'text-amber-500'}`}
                >
                  {saldoInsuficiente ? '⚠️ SALDO INSUFICIENTE EN CAJA' : 'Caja Actual'}
                </p>
                <p className="text-2xl font-black text-white italic font-mono tracking-tighter">
                  ${saldoActualCaja.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Valor del Gasto ($)
              </label>
              <div className="relative">
                <MdAttachMoney
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${saldoInsuficiente ? 'text-rose-500' : 'text-emerald-500'}`}
                  size={24}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className={`w-full bg-gray-50 border-2 rounded-2xl py-5 pl-12 pr-6 text-2xl font-black font-mono outline-none transition-all shadow-inner ${
                    saldoInsuficiente
                      ? 'border-rose-400 text-rose-600 focus:border-rose-600'
                      : 'border-transparent focus:border-amber-400'
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Categoría
              </label>
              <div className="flex-1 min-h-[58px] bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center px-4 gap-3 text-xs font-black uppercase text-gray-700">
                <MdCategory className="text-amber-500" size={20} />
                {formData.categoria || 'Seleccione abajo'}
              </div>
            </div>
          </div>

          {/* SELECTOR DE CATEGORIAS CON ALTURA EXTENDIDA Y SCROLL PERSONALIZADO */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Seleccionar Tipo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-4 categorias-scroll p-1">
              {categorias.map((cat) => (
                <button
                  key={cat.nombre}
                  type="button"
                  onClick={() => setFormData({ ...formData, categoria: cat.nombre })}
                  className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all gap-2 ${
                    formData.categoria === cat.nombre
                      ? 'bg-gray-900 border-amber-400 text-amber-400 shadow-lg'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200'
                  }`}
                >
                  <span className="text-xl">{cat.icono}</span>
                  <span className="text-[9px] font-black uppercase tracking-tight text-center leading-none">
                    {cat.nombre}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 italic">
              Justificación
            </label>
            <textarea
              required
              minLength={5}
              rows={3}
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })
              }
              className="w-full bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-[1.5rem] py-5 px-6 text-xs font-bold uppercase outline-none resize-none transition-all shadow-inner placeholder:text-gray-300"
              placeholder="EJ: PAGO DE SUMINISTROS..."
            />
          </div>

          <div
            className={`p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border ${
              saldoInsuficiente ? 'bg-rose-50 border-rose-100' : 'bg-gray-900 border-gray-800'
            }`}
          >
            <div className="text-center sm:text-left">
              <p
                className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${saldoInsuficiente ? 'text-rose-400' : 'text-gray-500'}`}
              >
                Monto a Liquidar
              </p>
              <p
                className={`text-4xl font-black italic font-mono leading-none ${saldoInsuficiente ? 'text-rose-600' : 'text-amber-400'}`}
              >
                ${montoIngresado.toFixed(2)}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.monto || !formData.categoria || saldoInsuficiente}
              className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                saldoInsuficiente
                  ? 'bg-rose-200 text-rose-400 cursor-not-allowed'
                  : 'bg-amber-400 text-amber-950 hover:bg-amber-300'
              }`}
            >
              {loading ? 'Confirmando...' : 'Finalizar Registro'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Gastos
