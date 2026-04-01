import useCompradores from '../../hooks/useCompradores'
import {
  CompradoresHeader,
  CompradoresTable,
  Container,
  Modal,
} from '../../components/index.components'
import { FaIdCard, FaPassport, FaUserAlt } from 'react-icons/fa'
import { MdEmail, MdListAlt, MdLocationOn, MdPhone } from 'react-icons/md'

const Compradores = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    isEdit,
    setIsEdit,
    selectedId,
    setSelectedId,
    compradores,
    loading,
    setLoading,
    fetching,
    formData,
    setFormData,
    fetchCompradores,
    error,
    handleNuevoComprador,
    searchTerm,
    setSearchTerm,
    compradoresFiltrados,
    handleDelete,
    verEliminados,
    setVerEliminados,
    handleOpenModal,
    handleRestore,
  } = useCompradores()

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER */}
        <CompradoresHeader
          handleOpenModal={handleOpenModal}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          verEliminados={verEliminados}
          setVerEliminados={setVerEliminados}
        />

        {/* CONTENEDOR PRINCIPAL */}
        <CompradoresTable
          fetching={fetching}
          handleDelete={handleDelete}
          handleOpenModal={setIsModalOpen}
          compradores={compradoresFiltrados}
          error={error}
          handleRestore={handleRestore}
          verEliminados={verEliminados}
        />
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Actualizar Datos' : 'Registrar Nuevo Comprador'}
      >
        <form onSubmit={handleNuevoComprador} className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Estado de Cuenta
              </p>
              <p className="text-xs font-bold text-gray-600 uppercase">
                ¿El comprador está habilitado?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.estaActivo}
                onChange={(e) => setFormData({ ...formData, estaActivo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Nombre Completo
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-amber-400 px-4 transition-all">
              <FaUserAlt className="text-amber-500 mr-3" />
              <input
                type="text"
                required
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="RAZÓN SOCIAL / NOMBRE"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Tipo de Doc.
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 transition-all">
                <MdListAlt className="text-amber-500 mr-3" size={20} />
                <select
                  value={formData.tipoIdentificacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoIdentificacion: e.target.value,
                      numeroIdentificacion: '',
                    })
                  }
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 cursor-pointer"
                >
                  <option value="Cédula">Cédula</option>
                  <option value="RUC">RUC</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Número de Doc.
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 transition-all">
                {formData.tipoIdentificacion === 'Pasaporte' ? (
                  <FaPassport className="text-amber-500 mr-3" />
                ) : (
                  <FaIdCard className="text-amber-500 mr-3" />
                )}
                <input
                  type="text"
                  required
                  maxLength={formData.tipoIdentificacion === 'RUC' ? 13 : 10}
                  value={formData.numeroIdentificacion}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroIdentificacion: e.target.value })
                  }
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Teléfono (Opcional)
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4">
                <MdPhone className="text-amber-500 mr-3" />
                <input
                  type="text"
                  maxLength={10}
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                  placeholder="09XXXXXXXX"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Email (Opcional)
              </label>
              <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4">
                <MdEmail className="text-amber-500 mr-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Dirección / Sector
            </label>
            <div className="flex items-center h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4">
              <MdLocationOn className="text-amber-500 mr-3" />
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value.toUpperCase() })
                }
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                placeholder="EJ. NARANJAL, GUAYAS"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-xl transition-all italic"
            >
              {loading ? 'Procesando...' : isEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Compradores
