import { useState } from 'react'
import {
  MdReceipt,
  MdAdd,
  MdPrint,
  MdVisibility,
  MdLocalShipping,
  MdAttachMoney,
  MdCheckCircle,
  MdCalendarToday,
} from 'react-icons/md'
import { FaSearch, FaUserTie, FaBoxOpen } from 'react-icons/fa'
import { Container, Modal } from '../../components/index.components'

const Ventas = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const [ventas] = useState([
    {
      id: 'v1',
      numeroFactura: 'LIQ-EXP-9901',
      fecha: '2026-03-06',
      comprador: 'Exportadora Noboa',
      producto: 'Cacao CCN-51 Seco',
      cantidadQuintales: 150.0,
      precioUnitario: 128.5,
      totalFactura: 19275.0,
      estado: 'Cobrado',
      montoPendiente: 0.0,
    },
  ])

  const handleOpenModal = (edit = false) => {
    setIsEdit(edit)
    setIsModalOpen(true)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        {/* ENCABEZADO DE PÁGINA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Ventas (Despachos)
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Registro de salida y control de liquidaciones
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(false)}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-amber-400 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <MdAdd size={20} /> Registrar Nueva Venta
          </button>
        </div>

        {/* FILTROS Y ESTADÍSTICAS */}
        {/* FILTROS Y ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-stretch">
          <div className="md:col-span-2 relative flex items-center">
            <FaSearch className="absolute left-5 text-gray-400 z-10" size={16} />
            <input
              type="text"
              placeholder="BUSCAR POR COMPRADOR O N° DE LIQUIDACIÓN..."
              className="w-full pl-14 pr-4 h-full min-h-[64px] bg-white border-2 border-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-amber-400 outline-none transition-all shadow-sm placeholder:text-gray-300"
            />
          </div>

          <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm min-h-[64px]">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MdCheckCircle size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Total Cobrado
              </p>
              <p className="text-lg font-black text-gray-800 font-mono mt-1">$19,275.00</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm min-h-[64px]">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <MdAttachMoney size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Por Cobrar
              </p>
              <p className="text-lg font-black text-gray-800 font-mono mt-1">$5,000.00</p>
            </div>
          </div>
        </div>
        {/* TABLA DE VENTAS */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Liquidación Recibida
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Comprador / Producto
                  </th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Volumen (qq)
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Monto Total
                  </th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Estado Pago
                  </th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 bg-white">
                {ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-amber-50/10 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center shadow-md">
                          <MdReceipt size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-800 uppercase tracking-tighter leading-none">
                            {venta.numeroFactura}
                          </div>
                          <div className="text-[9px] text-gray-400 font-bold mt-1 uppercase">
                            {venta.fecha}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-gray-700 uppercase tracking-tighter">
                        {venta.comprador}
                      </div>
                      <div className="text-[10px] text-amber-600 font-black flex items-center gap-1 mt-1 uppercase">
                        <MdLocalShipping size={14} /> {venta.producto}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-black text-gray-800">
                        {venta.cantidadQuintales.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-gray-400 font-black uppercase">
                        PRECIO: ${venta.precioUnitario}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-black text-gray-900 font-mono">
                        ${venta.totalFactura.toLocaleString()}
                      </div>
                      {venta.montoPendiente > 0 && (
                        <div className="text-[9px] font-black text-rose-500 uppercase mt-0.5">
                          SALDO: ${venta.montoPendiente.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          venta.estado === 'Cobrado'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                        }`}
                      >
                        {venta.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                          <MdVisibility size={20} />
                        </button>
                        <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                          <MdPrint size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PIE DE TABLA - RESUMEN */}
          <div className="bg-gray-900 px-8 py-6 flex justify-between items-center">
            <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">
              Aroma de Oro <span className="text-amber-500 italic">Logística de Ventas</span>
            </div>
            <div className="flex gap-12">
              <div className="text-right">
                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                  Quintales Despachados
                </p>
                <p className="text-xl font-black text-white leading-tight mt-1">
                  235.00 <span className="text-[10px]">QQ</span>
                </p>
              </div>
              <div className="text-right border-l border-gray-800 pl-12">
                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                  Monto Global Facturado
                </p>
                <p className="text-xl font-black text-white font-mono leading-tight mt-1">
                  $31,345.00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL REGISTRO DE VENTA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEdit ? 'Editar Liquidación' : 'Registrar Liquidación Recibida'}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                N° de Liquidación
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdReceipt className="text-amber-500 mr-3" size={20} />
                <input
                  type="text"
                  placeholder="LIQ-XXXX"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Fecha de Emisión
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <MdCalendarToday className="text-amber-500 mr-3" size={18} />
                <input
                  type="date"
                  className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Empresa Compradora
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
              <FaUserTie className="text-amber-500 mr-3" size={16} />
              <input
                type="text"
                placeholder="Ej. Exportadora Noboa"
                className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Producto Entregado
            </label>
            <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
              <FaBoxOpen className="text-amber-500 mr-3" size={18} />
              <select className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer uppercase">
                <option>Cacao CCN-51 Seco</option>
                <option>Cacao Arriba</option>
                <option>Cacao en Baba</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Cantidad (QQ)
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-transparent w-full outline-none text-sm font-black text-gray-700 font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                Precio/QQ
              </label>
              <div className="flex items-center h-12 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-400 px-4">
                <span className="text-amber-500 font-bold mr-1">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-transparent w-full outline-none text-sm font-black text-gray-700 font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-2">
                Total Neto
              </label>
              <div className="flex items-center h-12 bg-amber-50 rounded-xl border border-amber-200 px-4">
                <span className="text-amber-600 font-bold mr-1">$</span>
                <input
                  type="number"
                  readOnly
                  placeholder="0.00"
                  className="bg-transparent w-full outline-none text-sm font-black text-amber-700 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              Estado de Cobro
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-emerald-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 transition-all">
                <input
                  type="radio"
                  name="estado"
                  value="cobrado"
                  className="hidden"
                  defaultChecked
                />
                <MdCheckCircle className="text-emerald-500" size={18} />
                <span className="text-[10px] font-black uppercase text-gray-600">Cobrado</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-amber-50 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 transition-all">
                <input type="radio" name="estado" value="pendiente" className="hidden" />
                <MdAttachMoney className="text-amber-500" size={18} />
                <span className="text-[10px] font-black uppercase text-gray-600">Pendiente</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gray-900 text-amber-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 shadow-xl transition-all active:scale-95"
            >
              Confirmar Venta
            </button>
          </div>
        </form>
      </Modal>
    </Container>
  )
}

export default Ventas
