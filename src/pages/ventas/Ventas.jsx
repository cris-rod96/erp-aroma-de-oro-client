import { useState } from 'react'
import {
  MdReceipt,
  MdAdd,
  MdPrint,
  MdVisibility,
  MdLocalShipping,
  MdAttachMoney,
  MdCheckCircle,
} from 'react-icons/md'
import { FaSearch, FaCalendarAlt, FaUserTie } from 'react-icons/fa'
import { Container } from '../../components/index.components'

const Ventas = () => {
  // Datos basados en tu VentasModel (Sequelize)
  const [ventas] = useState([
    {
      id: 'v1',
      numeroFactura: 'LIQ-EXP-9901', // La que te da el comprador
      fecha: '2026-03-06',
      comprador: 'Exportadora Noboa',
      producto: 'Cacao CCN-51 Seco',
      cantidadQuintales: 150.0,
      precioUnitario: 128.5,
      totalFactura: 19275.0,
      estado: 'Cobrado',
      montoPendiente: 0.0,
      usuario: 'Admin',
    },
    {
      id: 'v2',
      numeroFactura: 'LIQ-EXP-9905',
      fecha: '2026-03-05',
      comprador: 'Cacao del Ecuador S.A.',
      producto: 'Cacao Arriba',
      cantidadQuintales: 85.0,
      precioUnitario: 142.0,
      totalFactura: 12070.0,
      estado: 'Crédito',
      montoPendiente: 5000.0,
      usuario: 'Admin',
    },
  ])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8">
        {/* CABECERA (Estilo Nómina/Compras) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Ventas (Despachos)</h1>
            <p className="text-gray-500 text-sm">
              Registro de salida de producto y control de liquidaciones recibidas.
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2 active:scale-95 uppercase tracking-widest">
            <MdAdd size={20} /> Registrar Nueva Venta
          </button>
        </div>

        {/* FILTROS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Buscar por Comprador o N° de Liquidación..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
            />
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg">
              <MdCheckCircle size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase leading-none">
                Total Cobrado
              </p>
              <p className="text-sm font-black text-gray-800 font-mono">$19,275.00</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg">
              <MdAttachMoney size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-red-600 uppercase leading-none">
                Por Cobrar
              </p>
              <p className="text-sm font-black text-gray-800 font-mono">$5,000.00</p>
            </div>
          </div>
        </div>

        {/* TABLA DE VENTAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5 text-left">Liquidación Recibida</th>
                  <th className="px-6 py-5 text-left">Comprador / Producto</th>
                  <th className="px-6 py-5 text-center">Volumen (qq)</th>
                  <th className="px-6 py-5 text-right">Monto Total</th>
                  <th className="px-6 py-5 text-center">Estado Pago</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-indigo-50/20 transition-colors group">
                    {/* Info de Liquidación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center border border-gray-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <MdReceipt size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-black text-gray-900 leading-none">
                            {venta.numeroFactura}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold mt-1 uppercase italic">
                            <FaCalendarAlt size={10} /> {venta.fecha}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Comprador y Producto */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                        <FaUserTie className="text-gray-300" size={12} /> {venta.comprador}
                      </div>
                      <div className="text-[11px] text-indigo-500 font-bold flex items-center gap-1 mt-1 uppercase tracking-tighter">
                        <MdLocalShipping size={14} /> {venta.producto}
                      </div>
                    </td>

                    {/* Volumen */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-black text-gray-800">
                        {venta.cantidadQuintales.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase italic">
                        @ ${venta.precioUnitario}
                      </div>
                    </td>

                    {/* Economía */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-black text-gray-900 font-mono italic">
                        ${venta.totalFactura.toFixed(2)}
                      </div>
                      {venta.montoPendiente > 0 && (
                        <div className="text-[9px] font-black text-red-500 uppercase tracking-tighter mt-0.5">
                          Saldo: ${venta.montoPendiente.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          venta.estado === 'Cobrado'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700 animate-pulse'
                        }`}
                      >
                        {venta.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-indigo-100 hover:shadow-sm"
                          title="Ver Detalle"
                        >
                          <MdVisibility size={18} />
                        </button>
                        <button
                          className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                          title="Imprimir Registro"
                        >
                          <MdPrint size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALES DE PIE DE TABLA */}
          <div className="bg-gray-50/50 px-8 py-5 border-t border-gray-100 flex justify-between items-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Responsable de turno: <span className="text-gray-600">Cristhian Rodríguez</span>
            </div>
            <div className="flex gap-10">
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                  Quintales Despachados
                </p>
                <p className="text-xl font-black text-gray-800 italic">
                  235.00 <span className="text-xs">qq</span>
                </p>
              </div>
              <div className="text-right border-l border-gray-200 pl-10">
                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                  Monto Global Facturado
                </p>
                <p className="text-xl font-black text-indigo-600 font-mono">$31,345.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Ventas
