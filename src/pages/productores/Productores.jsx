import {
  FaIdCard,
  FaUserAlt,
  FaPassport,
  FaReceipt,
  FaMoneyBillWave,
  FaUniversity,
  FaCheckDouble,
} from 'react-icons/fa'
import {
  Container,
  Modal,
  ProductoresHeader,
  ProductoresTable,
} from '../../components/index.components'
import {
  MdPhone,
  MdLocationOn,
  MdEmail,
  MdListAlt,
  MdCalendarToday,
  MdArrowBack,
  MdReceiptLong,
  MdClose,
  MdAttachMoney,
  MdAccountBalance,
  MdAccountBalanceWallet,
  MdMonetizationOn,
} from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'
import { productorAPI } from '../../api/index.api'
import Swal from 'sweetalert2'
import { useProductores } from '../../hooks/useProductores'
import { useState } from 'react'
import { useMemo } from 'react'
import { formatMoney } from '../../utils/fromatters'

const Productores = () => {
  const token = useAuthStore((state) => state.token)
  const {
    fetchProductores,
    fetching,
    formData,
    isEdit,
    isModalOpen,
    loading,
    productores,
    selectedId,
    setFormData,
    setIsEdit,
    setIsModalOpen,
    setLoading,
    error,
    setSelectedId,
  } = useProductores(token)
  const [searchTerm, setSearchTerm] = useState('')
  const [verEliminados, setVerEliminados] = useState(false)

  const [isLiqModalOpen, setIsLiqModalOpen] = useState(false)
  const [selectedProductorLiq, setSelectedProductorLiq] = useState(null)

  const productoresFiltrados = useMemo(() => {
    let lista = productores.filter((p) => p.estaActivo === !verEliminados)
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      lista = lista.filter(
        (p) =>
          p.numeroIdentificacion.toLowerCase().includes(search) ||
          p.nombreCompleto.toLowerCase().includes(search)
      )
    }

    return lista
  }, [productores, searchTerm, verEliminados])

  const handleOpenModal = (edit = false, productor = null) => {
    setIsEdit(edit)
    if (edit && productor) {
      setSelectedId(productor.id)
      setFormData({
        nombreCompleto: productor.nombreCompleto || '',
        tipoIdentificacion: productor.tipoIdentificacion || 'Cédula',
        numeroIdentificacion: productor.numeroIdentificacion || '',
        telefono: productor.telefono || '',
        direccion: productor.direccion || '',
        email: productor.email || '',
        tipo: 'Productor',
        estaActivo: productor.estaActivo ?? true,
      })
    } else {
      setSelectedId(null)
      setFormData({
        nombreCompleto: '',
        tipoIdentificacion: 'Cédula',
        numeroIdentificacion: '',
        telefono: '',
        direccion: '',
        email: '',
        tipo: 'Productor',
        estaActivo: true,
      })
    }
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const { tipoIdentificacion, numeroIdentificacion, telefono } = formData
    if (tipoIdentificacion === 'Cédula' && numeroIdentificacion.length !== 10) {
      Swal.fire('Atención', 'La cédula debe tener 10 dígitos', 'warning')
      return false
    }
    if (tipoIdentificacion === 'RUC' && numeroIdentificacion.length !== 13) {
      Swal.fire('Atención', 'El RUC debe tener 13 dígitos', 'warning')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      if (isEdit) {
        await productorAPI.actualizarProductor(selectedId, formData, token)
        Swal.fire('Éxito', 'Productor actualizado', 'success')
      } else {
        await productorAPI.agregarProductor(formData, token)
        Swal.fire('Éxito', 'Productor registrado', 'success')
      }
      setIsModalOpen(false)
      fetchProductores()
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error en la operación', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción desactivará al productor del sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'No',
    })
    if (confirm.isConfirmed) {
      try {
        await productorAPI.eliminarProductor(id, token)
        fetchProductores()
        Swal.fire('Borrado', 'Registro eliminado', 'success')
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  }

  // Función para ver liquidaciones (puedes navegar a otra ruta o abrir otro modal)
  const handleVerLiquidaciones = (productor) => {
    setSelectedProductorLiq(productor)
    setIsLiqModalOpen(true)
  }

  const swalConfig = {
    target: document.getElementById('root'), // O usa document.body si 'root' no funciona
    customClass: {
      container: 'my-swal-container',
    },
    didOpen: () => {
      // Forzamos el z-index al máximo posible
      Swal.getContainer().style.zIndex = '999999'
    },
  }

  const handleRestore = async (id) => {
    const confirm = await Swal.fire({
      ...swalConfig,
      title: '¿Restaurar productor?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // Emerald 500
      confirmButtonText: 'Sí, restaurar',
    })

    if (confirm.isConfirmed) {
      try {
        const resp = await productorAPI.recuperarProductor(id, token)
        Swal.fire(
          'Productor recuperado',
          resp.response?.data.message || 'Se recuperó al productor con éxito',
          'success'
        )
        fetchProductores()
        setVerEliminados(false)
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al recuperar productor'
        Swal.fire('Error', msg, 'error')
      }
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER */}
        <ProductoresHeader
          handleOpenModal={handleOpenModal}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          verEliminados={verEliminados}
          setVerEliminados={setVerEliminados}
        />

        {/* CONTENEDOR PRINCIPAL */}
        <ProductoresTable
          fetching={fetching}
          handleDelete={handleDelete}
          handleOpenModal={handleOpenModal}
          productores={productoresFiltrados}
          error={error}
          handleRestore={handleRestore}
          verEliminados={verEliminados}
          handleVerLiquidaciones={handleVerLiquidaciones}
        />
      </div>

      {isLiqModalOpen && selectedProductorLiq && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[90vh] shadow-2xl overflow-hidden border border-gray-200 flex flex-col transition-all">
            {/* Cabecera Refinada */}
            <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="bg-gray-900 p-3 rounded-2xl text-amber-400 shadow-xl">
                  <MdReceiptLong size={26} />
                </div>
                <div>
                  <h2 className="font-black uppercase tracking-tighter text-2xl text-gray-900 leading-none">
                    Auditoría Detallada: {selectedProductorLiq.nombreCompleto}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Consolidado de operaciones | RUC: {selectedProductorLiq.numeroIdentificacion}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLiqModalOpen(false)}
                className="bg-gray-100 text-gray-400 hover:text-gray-900 p-2 rounded-full transition-all"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Listado Expandido (Sin tarjetas, solo data pura) */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-900">
                    <tr className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                      <th className="px-6 py-5 text-left">Código / Fecha</th>
                      <th className="px-6 py-5 text-left">Producto / Calidad</th>
                      <th className="px-6 py-5 text-center">Análisis de Peso (Qq)</th>
                      <th className="px-6 py-5 text-center">Precio Unit.</th>
                      <th className="px-6 py-5 text-right">Deducciones</th>
                      <th className="px-6 py-5 text-right">Total Neto</th>
                      <th className="px-6 py-5 text-center">Método</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {selectedProductorLiq.Liquidacions?.map((liq) => {
                      const isEfectivo = parseFloat(liq.pagoEfectivo) > 0
                      return (
                        <tr key={liq.id} className="hover:bg-gray-50/80 transition-colors group">
                          {/* Código y Fecha */}
                          <td className="px-6 py-5">
                            <div className="text-[11px] font-black text-gray-900 font-mono italic group-hover:text-amber-600 transition-colors">
                              {liq.codigo}
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                              {new Date(liq.fecha).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Producto y Calificación */}
                          <td className="px-6 py-5">
                            <p className="text-[10px] font-black text-gray-800 uppercase leading-none">
                              {liq.DetalleLiquidacion?.descripcionProducto || 'CACAO SECO'}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                CALIF: {liq.DetalleLiquidacion?.calificacion + '%' || 'N/A'}
                              </span>
                            </div>
                          </td>

                          {/* Pesos: Bruto - Merma = Neto */}
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[11px] font-black text-gray-800 font-mono">
                                {liq.DetalleLiquidacion?.cantidadNeta}{' '}
                                <small className="text-[8px]">Qq</small>
                              </span>
                              <span className="text-[8px] font-bold text-red-400 uppercase tracking-tighter">
                                Merma: -{liq.DetalleLiquidacion?.descuentoMerma || '0.00'}
                              </span>
                            </div>
                          </td>

                          {/* Precio Unitario */}
                          <td className="px-6 py-5 text-center">
                            <span className="text-[11px] font-black text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 font-mono">
                              ${parseFloat(liq.DetalleLiquidacion?.precio).toFixed(2)}
                            </span>
                          </td>

                          {/* Retenciones / Descuentos */}
                          <td className="px-6 py-5 text-right">
                            <div className="text-[10px] font-bold text-red-500 font-mono">
                              -${parseFloat(liq.totalRetencion).toFixed(2)}
                            </div>
                            <div className="text-[7px] font-black text-gray-400 uppercase">
                              Retención Fuente
                            </div>
                          </td>

                          {/* Monto Final a Pagar */}
                          <td className="px-6 py-5 text-right">
                            <div className="text-sm font-black text-gray-900 font-mono tracking-tighter">
                              {formatMoney(liq.totalAPagar)}
                            </div>
                            <div
                              className={`text-[8px] font-black uppercase ${liq.estado === 'Pagada' ? 'text-emerald-500' : 'text-amber-500'}`}
                            >
                              {liq.estado}
                            </div>
                          </td>

                          {/* Método de Pago con Icono */}
                          <td className="px-6 py-5 text-center">
                            <div className="flex justify-center">
                              <span
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest ${
                                  isEfectivo
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {isEfectivo ? (
                                  <MdAttachMoney size={12} />
                                ) : (
                                  <MdAccountBalance size={12} />
                                )}
                                {isEfectivo ? 'Efectivo' : 'Bancos'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer con Resumen Simple Inline */}
            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white">
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    Total histórico
                  </span>
                  <span className="text-sm font-black text-gray-900 font-mono">
                    {formatMoney(
                      selectedProductorLiq.Liquidacions?.reduce(
                        (acc, l) => acc + parseFloat(l.totalAPagar),
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex flex-col border-l border-gray-100 pl-8">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    Registros
                  </span>
                  <span className="text-sm font-black text-gray-900 font-mono">
                    {selectedProductorLiq.Liquidacions?.length || 0}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsLiqModalOpen(false)}
                className="bg-gray-950 text-amber-400 px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl italic"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Actualizar Datos' : 'Registrar Nuevo Productor'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Estado de Cuenta
              </p>
              <p className="text-xs font-bold text-gray-600 uppercase">
                ¿El productor está habilitado?
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

export default Productores
