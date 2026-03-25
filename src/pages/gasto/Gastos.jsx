import { useState, useMemo, useEffect } from 'react'
import {
  FaPlus,
  FaBoxes,
  FaPrint,
  FaSearch,
  FaMoneyBillWave,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import { MdAttachMoney, MdDescription, MdSecurity, MdCategory } from 'react-icons/md'
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
  } = useGastos()

  // --- LÓGICA DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filtered.length])

  return (
    <Container fullWidth>
      <div className="w-full px-4 md:px-8 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none italic">
              Gastos Generales
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Aroma de Oro | Flujo de Caja
            </p>
          </div>
          {!error && (
            <button
              onClick={handleOpenModal}
              className="bg-gray-900 text-amber-400 px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase flex items-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-black border-b-4 border-amber-600 tracking-widest"
            >
              <FaPlus /> Registrar Gasto
            </button>
          )}
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
            {/* BUSCADOR */}
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

            {/* TABLA PRINCIPAL */}
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
                              Sincronizando gastos...
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
                              No se encontraron registros
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Mostrando{' '}
                  <span className="text-gray-900">
                    {filtered.length > 0 ? indexOfFirstItem + 1 : 0}
                  </span>{' '}
                  a{' '}
                  <span className="text-gray-900">
                    {Math.min(indexOfLastItem, filtered.length)}
                  </span>{' '}
                  de <span className="text-gray-900">{filtered.length}</span> gastos
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {[...Array(totalPages)]
                      .map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
                        >
                          {i + 1}
                        </button>
                      ))
                      .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
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
          {/* SALDO CAJA - ESTILO PREMIUM */}
          <div className="bg-gray-900 p-6 rounded-[2rem] flex items-center justify-between border-b-4 border-amber-500 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaMoneyBillWave size={80} className="text-white" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-amber-400 p-3 rounded-2xl text-amber-950 shadow-lg shadow-amber-400/20">
                <FaMoneyBillWave size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] leading-none mb-1">
                  Caja Actual
                </p>
                <p className="text-2xl font-black text-white italic font-mono tracking-tighter">
                  $
                  {parseFloat(caja?.saldoActual || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"
                  size={24}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl py-5 pl-12 pr-6 text-2xl font-black font-mono outline-none transition-all shadow-inner"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Categoría
              </label>
              <div className="flex-1 min-h-[58px] bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center px-4 gap-3">
                <MdCategory className="text-amber-500" size={20} />
                <span className="text-xs font-black uppercase text-gray-700 tracking-wider">
                  {formData.categoria || 'Seleccione abajo'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Seleccionar Tipo de Gasto
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-1">
              {categorias.map((cat) => (
                <button
                  key={cat.nombre}
                  type="button"
                  onClick={() => setFormData({ ...formData, categoria: cat.nombre })}
                  className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all gap-2 group/cat ${
                    formData.categoria === cat.nombre
                      ? 'bg-gray-900 border-amber-400 text-amber-400 shadow-lg scale-[0.98]'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200 hover:text-gray-600'
                  }`}
                >
                  <span
                    className={`text-xl transition-transform group-hover/cat:scale-110 ${formData.categoria === cat.nombre ? 'text-amber-400' : 'text-gray-300'}`}
                  >
                    {cat.icono}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tight text-center leading-none">
                    {cat.nombre}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 italic">
              Justificación del Egreso
            </label>
            <div className="relative">
              <MdDescription className="absolute left-5 top-5 text-gray-300" size={20} />
              <textarea
                required
                minLength={5}
                rows={3}
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })
                }
                className="w-full bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-[1.5rem] py-5 pl-14 pr-6 text-xs font-bold uppercase outline-none resize-none transition-all shadow-inner placeholder:text-gray-300"
                placeholder="EJ: PAGO DE ENERGÍA ELÉCTRICA - BODEGA CENTRAL..."
              />
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-gray-800">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">
                Monto a Liquidar
              </p>
              <p className="text-4xl font-black italic font-mono text-amber-400 leading-none">
                ${parseFloat(formData.monto || 0).toFixed(2)}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.monto || !formData.categoria}
              className="w-full sm:w-auto bg-amber-400 text-amber-950 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_10px_20px_rgba(251,191,36,0.3)] active:scale-95 disabled:bg-gray-800 disabled:text-gray-600 disabled:shadow-none transition-all hover:bg-amber-300"
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
