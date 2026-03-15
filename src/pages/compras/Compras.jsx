// import { useState, useEffect } from 'react'
// import { MdPrint, MdDelete, MdBusiness, MdSearch } from 'react-icons/md'
// import { Container } from '../../components/index.components'
// import { useAuthStore } from '../../store/useAuthStore'
// import Swal from 'sweetalert2'
// import { empresaAPI, liquidacionAPI, productorAPI, ticketAPI } from '../../api/index.api'

// const Compras = () => {
//   const empresaData = {
//     nombre: 'Cargando',
//     ruc: '......',
//     direccion: '.......',
//     telefono: '',
//   }

//   // Estados de datos
//   const [liquidaciones, setLiquidaciones] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [ticketsPendientes, setTicketsPendientes] = useState([])
//   const [productores, setProductores] = useState([])
//   const [empresa, setEmpresa] = useState(empresaData)

//   // Estados de formulario
//   const [ticketSeleccionado, setTicketSeleccionado] = useState(null)
//   const [productorInfo, setProductorInfo] = useState(null)
//   const [precio, setPrecio] = useState(0)
//   const [prima, setPrima] = useState(0)
//   const [ivaPorcentaje, setIvaPorcentaje] = useState(0)
//   const [calificacion, setCalificacion] = useState('')
//   const [unidad, setUnidad] = useState('QUINTALES')
//   const [retencionConcepto, setRetencionConcepto] = useState('')
//   const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)
//   const [descuento, setDescuento] = useState(0)
//   const [pagos, setPagos] = useState({ efectivo: 0, cheque: 0, transferencia: 0 })

//   // Estados de Filtros
//   const [filtroTipo, setFiltroTipo] = useState('todas')
//   const [filtroValor, setFiltroValor] = useState('')

//   const token = useAuthStore((store) => store.token)
//   const user = useAuthStore((store) => store.adminData)

//   const fetchDatos = async () => {
//     setLoading(true)
//     try {
//       const [respTickets, respProductores, respLiq, respEmpresa] = await Promise.all([
//         ticketAPI.listarTicketsPendientes(token),
//         productorAPI.listarTodos(token),
//         liquidacionAPI.listarTodas(token),
//         empresaAPI.obtenerInformacion(token),
//       ])
//       setTicketsPendientes(respTickets.data.tickets || [])
//       setProductores(respProductores.data.productores || [])
//       setLiquidaciones(respLiq.data.liquidaciones || [])
//       setEmpresa(respEmpresa.data.empresa || empresaData)
//     } catch (error) {
//       console.error('Error cargando datos:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchDatos()
//   }, [token])

//   const handleFiltrar = async () => {
//     try {
//       let resp
//       if (filtroTipo === 'usuario') {
//         resp = await liquidacionAPI.listarPorUsuario(token, user.id)
//       } else if (filtroTipo === 'productor' && filtroValor) {
//         resp = await liquidacionAPI.listarPorProductor(token, filtroValor)
//       } else {
//         resp = await liquidacionAPI.listarTodas(token)
//       }
//       setLiquidaciones(resp.data.liquidaciones || [])
//     } catch (error) {
//       Swal.fire('Error', 'No se pudo aplicar el filtro', 'error')
//     }
//   }

//   const handleTicketChange = (id) => {
//     const tk = ticketsPendientes.find((t) => t.id === id)
//     setTicketSeleccionado(tk)
//     if (tk) {
//       const prod = productores.find((p) => p.numeroIdentificacion === tk.identificacionTemporal)
//       setProductorInfo(prod || { nombreCompleto: 'NO REGISTRADO' })
//     }
//   }

//   const bruto = (ticketSeleccionado?.pesoNeto || 0) * precio
//   const parcial = bruto + parseFloat(prima || 0)
//   const valorIVA = parcial * (ivaPorcentaje / 100)
//   const subtotalConIva = parcial + valorIVA
//   const valorRetenido = subtotalConIva * (retencionPorcentaje / 100)
//   const totalAPagar = subtotalConIva - valorRetenido - parseFloat(descuento || 0)
//   const montoAbonado = Object.values(pagos).reduce(
//     (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
//     0
//   )
//   const saldoADeber = totalAPagar - montoAbonado

//   const handleGuardar = async () => {
//     if (!ticketSeleccionado) return Swal.fire('Error', 'Debe seleccionar un ticket', 'error')
//     if (totalAPagar <= 0) return Swal.fire('Error', 'El total debe ser mayor a 0', 'error')
//     if (!user?.id) return Swal.fire('Error', 'No se detectó el usuario en sesión', 'error')

//     try {
//       // 2. FORMATEO DE LA DATA PARA EL BACKEND
//       const data = {
//         // --- MODELO: LIQUIDACION ---
//         liquidacion: {
//           subtotal_12: parseFloat(ivaPorcentaje) > 0 ? parcial : 0,
//           subtotal_0: parseFloat(ivaPorcentaje) === 0 ? parcial : 0,
//           ivaTotal: valorIVA,
//           totalRetencion: valorRetenido,
//           totalLiquidacion: parcial,
//           totalAPagar: totalAPagar,
//           pagoEfectivo: parseFloat(pagos.efectivo || 0),
//           pagoCheque: parseFloat(pagos.cheque || 0),
//           pagoTransferencia: parseFloat(pagos.transferencia || 0),
//           montoAbonado: montoAbonado,
//           montoPorPagar: saldoADeber,
//           UsuarioId: user.id,
//           ProductorId: productorInfo.id,
//           TicketId: ticketSeleccionado.id,
//         },

//         // --- MODELO: DETALLE LIQUIDACION ---
//         detalle: {
//           descripcionProducto: ticketSeleccionado?.Producto?.nombre || 'PRODUCTO SIN NOMBRE',
//           calificacion: parseFloat(calificacion) || 0, // Asegúrate que sea número según tu modelo
//           porcentajeIVa: parseFloat(ivaPorcentaje),
//           unidad: 'Quintal', // Según tu ENUM ['Quintal']
//           cantidad: parseFloat(ticketSeleccionado?.pesoNeto || 0),
//           precio: parseFloat(precio),
//           prima: parseFloat(prima),
//           parcial: parcial,
//           ProductoId: ticketSeleccionado?.ProductoId,
//         },

//         // --- MODELO: RETENCION (Si aplica) ---
//         retencion:
//           retencionPorcentaje > 0
//             ? {
//                 descripcion: retencionConcepto || 'RETENCION EN LA FUENTE',
//                 porcentajeRetencion: parseFloat(retencionPorcentaje),
//                 valorRetenido: valorRetenido,
//               }
//             : null,
//       }

//       console.log('Objeto preparado para el backend:', data)

//       // 3. PETICIÓN MEDIANTE TU API
//       const response = await liquidacionAPI.crearLiquidacion(token, data)

//       if (response.status === 201 || response.status === 200) {
//         Swal.fire('Éxito', 'Liquidación guardada correctamente', 'success')
//         fetchDatos() // Recargar la tabla
//         // Limpiar estados aquí si es necesario
//       }
//     } catch (error) {
//       console.error('Error al procesar la data:', error.response.data.message)
//       Swal.fire('Error', 'Hubo un fallo al preparar el envío', 'error')
//     }
//   }

//   return (
//     <Container fullWidth={true}>
//       <div className="w-full px-2 md:px-6 py-4 text-gray-800 bg-white font-sans">
//         {/* CABECERA */}
//         <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 border-gray-800 pb-4 mb-6 gap-4 text-center md:text-left">
//           <div className="flex flex-col md:flex-row items-center gap-4">
//             <MdBusiness size={45} />
//             <div>
//               <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
//                 {empresa.nombre}
//               </h1>
//               <p className="text-[10px] font-bold text-gray-600 uppercase">
//                 {empresa.ruc} | {empresa.direccion}
//               </p>
//             </div>
//           </div>
//           <div className="bg-white border-2 border-gray-800 p-2 w-full md:w-auto">
//             <h2 className="text-sm md:text-lg font-black uppercase">Liquidación de Compra</h2>
//             <p className="font-mono font-bold text-xs uppercase text-gray-500">
//               Borrador: 001-001-X
//             </p>
//           </div>
//         </div>

//         {/* SELECCIÓN TICKET */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 py-4 border-b border-gray-200">
//           <div className="md:col-span-2">
//             <label className="text-[11px] font-black uppercase mb-1 block text-gray-700">
//               Ticket de Recepción
//             </label>
//             <select
//               onChange={(e) => handleTicketChange(e.target.value)}
//               className="w-full border-2 border-gray-800 p-3 text-sm font-bold uppercase outline-none bg-white"
//             >
//               <option value="">-- SELECCIONE UN TICKET --</option>
//               {ticketsPendientes.map((tk) => (
//                 <option key={tk.id} value={tk.id}>
//                   #{tk.numero} - CI: {tk.identificacionTemporal}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="text-[11px] font-black uppercase mb-1 block text-gray-700">
//               Beneficiario
//             </label>
//             <div className="border-2 border-gray-300 p-3 text-sm font-black uppercase bg-gray-50 min-h-[48px] flex items-center">
//               {productorInfo?.nombreCompleto || 'ESPERANDO SELECCIÓN...'}
//             </div>
//           </div>
//         </div>

//         {/* DETALLE PRODUCTO - ESCRITORIO */}
//         <div className="hidden lg:block mb-8 border-2 border-gray-800 overflow-hidden">
//           <table className="w-full border-collapse">
//             <thead className="bg-gray-800 text-white text-[10px] font-black uppercase">
//               <tr>
//                 <th className="p-2 border-r border-gray-600 text-left">Producto</th>
//                 <th className="p-2 border-r border-gray-600 w-24">Calif.</th>
//                 <th className="p-2 border-r border-gray-600 w-32">Unidad</th>
//                 <th className="p-2 border-r border-gray-600 w-28">Peso Neto</th>
//                 <th className="p-2 border-r border-gray-600 w-28">Precio U.</th>
//                 <th className="p-2 border-r border-gray-600 w-24">Prima</th>
//                 <th className="p-2 border-r border-gray-600 w-20">IVA %</th>
//                 <th className="p-2 text-right w-36">Subtotal</th>
//               </tr>
//             </thead>
//             <tbody className="text-black font-black uppercase">
//               <tr className="border-b border-gray-800 text-center">
//                 <td className="p-4 border-r border-gray-800 text-left">
//                   {ticketSeleccionado?.Producto?.nombre || '---'}
//                 </td>
//                 <td className="p-2 border-r border-gray-800">
//                   <input
//                     type="text"
//                     placeholder="---"
//                     value={calificacion}
//                     onChange={(e) => setCalificacion(e.target.value.toUpperCase())}
//                     className="w-full text-center outline-none bg-gray-50 p-2"
//                   />
//                 </td>
//                 <td className="p-2 border-r border-gray-800">
//                   <input
//                     type="text"
//                     value={unidad}
//                     onChange={(e) => setUnidad(e.target.value.toUpperCase())}
//                     className="w-full text-center outline-none p-2"
//                   />
//                 </td>
//                 <td className="p-4 border-r border-gray-800 font-mono text-xl">
//                   {ticketSeleccionado?.pesoNeto || '0.00'}
//                 </td>
//                 <td className="p-2 border-r border-gray-800">
//                   <input
//                     type="number"
//                     value={precio}
//                     onChange={(e) => setPrecio(e.target.value)}
//                     className="w-full text-center font-mono text-xl outline-none p-2 bg-gray-50"
//                   />
//                 </td>
//                 <td className="p-2 border-r border-gray-800">
//                   <input
//                     type="number"
//                     value={prima}
//                     onChange={(e) => setPrima(e.target.value)}
//                     className="w-full text-center font-mono text-xl outline-none p-2"
//                   />
//                 </td>
//                 <td className="p-2 border-r border-gray-800">
//                   <input
//                     type="number"
//                     value={ivaPorcentaje}
//                     onChange={(e) => setIvaPorcentaje(e.target.value)}
//                     className="w-full text-center font-mono text-xl outline-none p-2"
//                   />
//                 </td>
//                 <td className="p-4 text-right font-mono text-2xl bg-gray-100">
//                   ${parcial.toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* DETALLE PRODUCTO - MÓVIL (CARDS) */}
//         <div className="lg:hidden space-y-4 mb-8">
//           <div className="border-2 border-gray-800 p-4 rounded-md">
//             <h3 className="font-black uppercase border-b-2 border-gray-800 mb-3 text-sm">
//               {ticketSeleccionado?.Producto?.nombre || 'Producto no seleccionado'}
//             </h3>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="col-span-2 flex justify-between items-center bg-gray-100 p-2">
//                 <span className="text-[10px] font-black uppercase">Peso Neto:</span>
//                 <span className="font-mono font-black text-lg">
//                   {ticketSeleccionado?.pesoNeto || '0.00'}
//                 </span>
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase text-gray-500 block">
//                   Precio Unit.
//                 </label>
//                 <input
//                   type="number"
//                   value={precio}
//                   onChange={(e) => setPrecio(e.target.value)}
//                   className="w-full border border-gray-800 p-2 font-mono font-bold"
//                 />
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase text-gray-500 block">
//                   Calificación
//                 </label>
//                 <input
//                   type="text"
//                   value={calificacion}
//                   onChange={(e) => setCalificacion(e.target.value.toUpperCase())}
//                   className="w-full border border-gray-800 p-2 font-bold uppercase"
//                 />
//               </div>
//               <div className="col-span-2 text-right pt-2 border-t">
//                 <span className="text-[10px] font-black uppercase text-gray-500">Subtotal:</span>
//                 <p className="text-xl font-mono font-black">${parcial.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* RETENCIONES Y PAGOS */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           <div className="border-2 border-gray-800 p-4 space-y-4">
//             <p className="text-[11px] font-black uppercase border-b border-gray-800 pb-1 text-gray-700">
//               Retenciones (Manual)
//             </p>
//             <div className="flex flex-col gap-2">
//               <label className="text-[11px] font-black text-gray-700 uppercase">
//                 Concepto de Retención
//               </label>
//               <input
//                 type="text"
//                 placeholder="DESCRIPCIÓN DE RETENCIÓN"
//                 value={retencionConcepto}
//                 onChange={(e) => setRetencionConcepto(e.target.value.toUpperCase())}
//                 className="w-full border border-gray-800 p-2 text-xs font-bold uppercase outline-none"
//               />
//             </div>
//             <div className="flex justify-between items-end">
//               <div className="flex flex-col gap-1">
//                 <label className="text-[11px] font-black text-gray-700 uppercase">
//                   Porcentaje %
//                 </label>
//                 <input
//                   type="number"
//                   value={retencionPorcentaje}
//                   onChange={(e) => setRetencionPorcentaje(e.target.value)}
//                   className="border-2 border-gray-800 p-2 font-mono font-black text-xl w-24 outline-none"
//                 />
//               </div>
//               <div className="text-right">
//                 <span className="text-[10px] font-black uppercase text-gray-500">Monto:</span>
//                 <p className="text-2xl font-mono font-black text-red-600">
//                   -${valorRetenido.toFixed(2)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="border-4 border-gray-800 p-4 bg-gray-50 shadow-md">
//             <div className="flex justify-between font-black text-3xl uppercase border-b-2 border-gray-800 mb-4 pb-1">
//               <span>Total:</span>
//               <span>${totalAPagar.toFixed(2)}</span>
//             </div>

//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
//               <div className="border-2 border-red-600 p-2 bg-red-50">
//                 <label className="text-[10px] font-black uppercase block text-red-600">Dcto.</label>
//                 <input
//                   type="number"
//                   value={descuento}
//                   onChange={(e) => setDescuento(e.target.value)}
//                   className="w-full font-mono font-black text-lg outline-none bg-transparent text-red-600"
//                 />
//               </div>
//               <div className="border-2 border-gray-800 p-2 bg-white">
//                 <label className="text-[10px] font-black uppercase block text-gray-700">
//                   Efect.
//                 </label>
//                 <input
//                   type="number"
//                   value={pagos.efectivo}
//                   onChange={(e) => setPagos({ ...pagos, efectivo: e.target.value })}
//                   className="w-full font-mono font-black text-lg outline-none bg-transparent"
//                 />
//               </div>
//               <div className="border-2 border-gray-800 p-2 bg-white">
//                 <label className="text-[10px] font-black uppercase block text-gray-700">
//                   Cheq.
//                 </label>
//                 <input
//                   type="number"
//                   value={pagos.cheque}
//                   onChange={(e) => setPagos({ ...pagos, cheque: e.target.value })}
//                   className="w-full font-mono font-black text-lg outline-none bg-transparent"
//                 />
//               </div>
//               <div className="border-2 border-gray-800 p-2 bg-white">
//                 <label className="text-[10px] font-black uppercase block text-gray-700">
//                   Trans.
//                 </label>
//                 <input
//                   type="number"
//                   value={pagos.transferencia}
//                   onChange={(e) => setPagos({ ...pagos, transferencia: e.target.value })}
//                   className="w-full font-mono font-black text-lg outline-none bg-transparent"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
//               <div className="bg-white border-2 border-gray-800 p-2 text-center text-gray-900">
//                 <p className="text-[9px] font-black uppercase text-gray-500">Abonado</p>
//                 <p className="text-xl font-mono font-black">${montoAbonado.toFixed(2)}</p>
//               </div>
//               <div className="bg-gray-800 text-white p-2 text-center">
//                 <p className="text-[9px] font-black uppercase text-gray-400">Saldo</p>
//                 <p className="text-xl font-mono font-black">${saldoADeber.toFixed(2)}</p>
//               </div>
//             </div>

//             <button
//               className="w-full bg-gray-900 text-white font-black py-4 uppercase text-xs hover:bg-black transition-colors"
//               onClick={handleGuardar}
//             >
//               Guardar Liquidación
//             </button>
//           </div>
//         </div>

//         {/* HISTORIAL CON FILTROS */}
//         <div className="mt-8">
//           <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4 border-b-2 border-gray-800 pb-2">
//             <h3 className="text-sm font-black uppercase text-gray-700">
//               Historial de Liquidaciones
//             </h3>
//             <div className="flex flex-wrap gap-2 items-center">
//               <select
//                 value={filtroTipo}
//                 onChange={(e) => setFiltroTipo(e.target.value)}
//                 className="border border-gray-800 p-1 text-[10px] font-black uppercase outline-none h-[35px]"
//               >
//                 <option value="todas">Todas</option>
//                 <option value="usuario">Mis Registros</option>
//                 <option value="productor">Por Productor</option>
//               </select>
//               {filtroTipo === 'productor' && (
//                 <select
//                   value={filtroValor}
//                   onChange={(e) => setFiltroValor(e.target.value)}
//                   className="border border-gray-800 p-1 text-[10px] font-black uppercase outline-none h-[35px] max-w-[150px]"
//                 >
//                   <option value="">Seleccione...</option>
//                   {productores.map((p) => (
//                     <option key={p.id} value={p.id}>
//                       {p.nombreCompleto}
//                     </option>
//                   ))}
//                 </select>
//               )}
//               <button
//                 onClick={handleFiltrar}
//                 className="bg-gray-800 text-white px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1 h-[35px]"
//               >
//                 <MdSearch size={14} /> Filtrar
//               </button>
//             </div>
//           </div>

//           <div className="overflow-x-auto border border-gray-300">
//             {loading ? (
//               <div className="p-10 text-center font-black uppercase text-gray-400">
//                 Cargando datos...
//               </div>
//             ) : liquidaciones.length === 0 ? (
//               <div className="p-10 text-center bg-gray-50 border-2 border-dashed border-gray-300">
//                 <p className="font-black uppercase text-gray-500 italic text-sm">
//                   No se encontraron liquidaciones registradas bajo estos criterios.
//                 </p>
//                 <button
//                   onClick={fetchDatos}
//                   className="mt-2 text-[10px] font-black uppercase underline text-gray-800"
//                 >
//                   Actualizar lista
//                 </button>
//               </div>
//             ) : (
//               <table className="w-full border-collapse min-w-[600px]">
//                 <thead className="bg-gray-100 text-[9px] font-black uppercase border-b border-gray-800">
//                   <tr>
//                     <th className="p-3 text-left">Código / Fecha</th>
//                     <th className="p-3 text-left">Productor</th>
//                     <th className="p-3 text-right">Total Liq.</th>
//                     <th className="p-3 text-right text-red-600 font-black">Pendiente</th>
//                     <th className="p-3 text-center">Acción</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-[11px] font-bold uppercase text-black">
//                   {liquidaciones.map((liq) => (
//                     <tr key={liq.id} className="border-b border-gray-200 hover:bg-gray-50">
//                       <td className="p-3">
//                         <div className="font-black text-gray-900">{liq.codigo}</div>
//                         <div className="font-mono text-[9px] text-gray-500">
//                           {new Date(liq.fecha).toLocaleString()}
//                         </div>
//                       </td>
//                       <td className="p-3">{liq.Productor?.nombreCompleto || '---'}</td>
//                       <td className="p-3 text-right font-mono font-black">
//                         ${parseFloat(liq.totalLiquidacion).toFixed(2)}
//                       </td>
//                       <td className="p-3 text-right font-mono text-red-600 font-black">
//                         ${parseFloat(liq.montoPorPagar).toFixed(2)}
//                       </td>
//                       <td className="p-3 text-center flex justify-center gap-3">
//                         <MdPrint size={18} className="cursor-pointer" />
//                         <MdDelete
//                           size={18}
//                           className="cursor-pointer text-gray-400 hover:text-red-600"
//                         />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </Container>
//   )
// }

// export default Compras
import { useState, useEffect } from 'react'
import {
  MdPrint,
  MdDelete,
  MdBusiness,
  MdSearch,
  MdPersonAdd,
  MdPayments,
  MdMoneyOff,
} from 'react-icons/md'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore' // Importado
import Swal from 'sweetalert2'
import { empresaAPI, liquidacionAPI, productorAPI, productoAPI } from '../../api/index.api'

const Compras = () => {
  const empresaData = { nombre: 'Cargando', ruc: '......', direccion: '.......', telefono: '' }

  // Estados de datos
  const [liquidaciones, setLiquidaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [productores, setProductores] = useState([])
  const [productos, setProductos] = useState([])
  const [empresa, setEmpresa] = useState(empresaData)

  // Estados de Formulario
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [productorInfo, setProductorInfo] = useState(null)
  const [mostrarFormProductor, setMostrarFormProductor] = useState(false)

  // Datos de la Transacción
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [calificacion, setCalificacion] = useState('')
  const [unidad, setUnidad] = useState('Quintales') // Valor inicial normalizado
  const [cantidad, setCantidad] = useState(0)
  const [precio, setPrecio] = useState(0)
  const [prima, setPrima] = useState(0)
  const [ivaPorcentaje, setIvaPorcentaje] = useState(0)

  // Retenciones y Descuentos
  const [retencionConcepto, setRetencionConcepto] = useState('')
  const [retencionPorcentaje, setRetencionPorcentaje] = useState(0)
  const [descuento, setDescuento] = useState(0)
  const [pagos, setPagos] = useState({ efectivo: 0, cheque: 0, transferencia: 0 })

  const [nuevoProductor, setNuevoProductor] = useState({
    nombreCompleto: '',
    numeroIdentificacion: '',
    direccion: '',
    telefono: '',
  })

  const token = useAuthStore((store) => store.token)
  const user = useAuthStore((store) => store.user) // Cambiado a store.user según tu sistema
  const caja = useCajaStore((store) => store.caja) // Obtener caja activa

  const fetchInicial = async () => {
    try {
      const [respProd, respEmpresa, respLiq, respItems] = await Promise.all([
        productorAPI.listarTodos(token),
        empresaAPI.obtenerInformacion(token),
        liquidacionAPI.listarTodas(token),
        productoAPI.listarProductos(token),
      ])
      setProductores(respProd.data.productores || [])
      setEmpresa(respEmpresa.data.empresa || empresaData)
      setLiquidaciones(respLiq.data.liquidaciones || [])
      setProductos(respItems.data.productos || [])
    } catch (error) {
      console.error('Error inicial:', error)
    }
  }

  useEffect(() => {
    fetchInicial()
  }, [token])

  const buscarProductor = () => {
    const encontrado = productores.find((p) => p.numeroIdentificacion === cedulaBusqueda)
    if (encontrado) {
      setProductorInfo(encontrado)
      setMostrarFormProductor(false)
    } else {
      setProductorInfo(null)
      setMostrarFormProductor(true)
      setNuevoProductor({ ...nuevoProductor, numeroIdentificacion: cedulaBusqueda })
    }
  }

  const handleRegistrarProductor = async () => {
    try {
      const resp = await productorAPI.agregarProductor(nuevoProductor, token)
      setProductores([...productores, resp.data.productor])
      setProductorInfo(resp.data.productor)
      setMostrarFormProductor(false)
      Swal.fire('Registrado', 'Productor creado con éxito', 'success')
    } catch (error) {
      Swal.fire('Error', 'No se pudo registrar', 'error')
    }
  }

  // CÁLCULOS
  const bruto = parseFloat(cantidad || 0) * parseFloat(precio || 0)
  const parcial = bruto + parseFloat(prima || 0)
  const valorIVA = parcial * (parseFloat(ivaPorcentaje || 0) / 100)
  const subtotalConIva = parcial + valorIVA
  const valorRetenido = subtotalConIva * (parseFloat(retencionPorcentaje || 0) / 100)
  const totalAPagar = subtotalConIva - valorRetenido - parseFloat(descuento || 0)
  const montoAbonado = Object.values(pagos).reduce(
    (a, b) => parseFloat(a || 0) + parseFloat(b || 0),
    0
  )
  const saldoADeber = totalAPagar - montoAbonado

  const handleGuardar = async () => {
    if (!caja || caja.estado !== 'Abierta') {
      return Swal.fire(
        'Caja Cerrada',
        'Debe tener una caja abierta para registrar compras',
        'warning'
      )
    }
    if (!productorInfo) return Swal.fire('Error', 'Identifique un productor', 'error')
    if (totalAPagar <= 0) return Swal.fire('Error', 'Monto inválido', 'error')

    const data = {
      liquidacion: {
        subtotal_12: parseFloat(ivaPorcentaje) > 0 ? parcial : 0,
        subtotal_0: parseFloat(ivaPorcentaje) === 0 ? parcial : 0,
        ivaTotal: valorIVA,
        totalRetencion: valorRetenido,
        totalLiquidacion: parcial,
        totalAPagar: totalAPagar,
        pagoEfectivo: parseFloat(pagos.efectivo || 0),
        pagoCheque: parseFloat(pagos.cheque || 0),
        pagoTransferencia: parseFloat(pagos.transferencia || 0),
        montoAbonado,
        montoPorPagar: saldoADeber,
        UsuarioId: user.id,
        ProductorId: productorInfo.id,
      },
      detalle: {
        descripcionProducto:
          productos.find((p) => p.id === productoSeleccionado)?.nombre || 'VARIOS',
        calificacion,
        porcentajeIVa: parseFloat(ivaPorcentaje),
        unidad,
        cantidad: parseFloat(cantidad),
        precio: parseFloat(precio),
        prima: parseFloat(prima),
        parcial: parcial,
        ProductoId: productoSeleccionado,
      },
      retencion:
        retencionPorcentaje > 0
          ? {
              descripcion: retencionConcepto || 'RETENCION EN LA FUENTE',
              porcentajeRetencion: parseFloat(retencionPorcentaje),
              valorRetenido: valorRetenido,
            }
          : null,
      CajaId: caja.id, // Inyección de la caja
    }

    try {
      setLoading(true)
      await liquidacionAPI.crearLiquidacion(token, data)
      Swal.fire('Éxito', 'Compra guardada y stock actualizado', 'success')
      fetchInicial()
      // Limpiar formulario
      setProductorInfo(null)
      setCedulaBusqueda('')
      setCantidad(0)
      setPrecio(0)
      setPagos({ efectivo: 0, cheque: 0, transferencia: 0 })
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Fallo en guardado', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-2 md:px-6 py-4 text-gray-800 bg-white font-sans">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-800 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-4">
            <MdBusiness size={45} />
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                {empresa.nombre}
              </h1>
              <p className="text-[10px] font-bold text-gray-600 uppercase">
                {empresa.ruc} | {empresa.direccion}
              </p>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-800 p-2 text-center w-full md:w-auto">
            <h2 className="text-sm md:text-lg font-black uppercase px-4">
              Liquidación de Compra Directa
            </h2>
            <p className="text-[10px] font-black text-emerald-600">
              {caja ? `CAJA ACTIVA: ${caja.id.slice(0, 8)}` : 'SIN CAJA'}
            </p>
          </div>
        </div>

        {/* BUSCADOR PRODUCTOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase mb-1 block">
              Identificación del Productor (Cédula/RUC)
            </label>
            <div className="flex border-2 border-gray-800">
              <input
                type="text"
                className="w-full p-3 font-bold outline-none uppercase"
                placeholder="BUSCAR..."
                value={cedulaBusqueda}
                onChange={(e) => setCedulaBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarProductor()}
              />
              <button
                onClick={buscarProductor}
                className="bg-gray-800 text-white px-6 hover:bg-black"
              >
                <MdSearch size={22} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase mb-1 block">Beneficiario</label>
            <div className="border-2 border-gray-300 p-3 font-black text-sm bg-gray-50 min-h-[52px] flex items-center uppercase">
              {productorInfo?.nombreCompleto || (
                <span className="text-gray-400 italic font-normal text-xs text-center w-full">
                  No identificado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* REGISTRO RÁPIDO PRODUCTOR */}
        {mostrarFormProductor && (
          <div className="mb-6 p-4 border-2 border-blue-600 bg-blue-50 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3 flex items-center gap-2 text-blue-800 font-black text-xs uppercase border-b border-blue-200 pb-1">
              <MdPersonAdd size={16} /> Nuevo Productor - Completar Datos
            </div>
            <input
              className="p-2 border border-blue-300 text-xs font-bold uppercase"
              placeholder="Nombre Completo"
              value={nuevoProductor.nombreCompleto}
              onChange={(e) =>
                setNuevoProductor({
                  ...nuevoProductor,
                  nombreCompleto: e.target.value.toUpperCase(),
                })
              }
            />
            <input
              className="p-2 border border-blue-300 text-xs font-bold uppercase"
              placeholder="Dirección"
              value={nuevoProductor.direccion}
              onChange={(e) =>
                setNuevoProductor({ ...nuevoProductor, direccion: e.target.value.toUpperCase() })
              }
            />
            <button
              onClick={handleRegistrarProductor}
              className="bg-blue-600 text-white font-black text-xs py-2 uppercase"
            >
              Registrar
            </button>
          </div>
        )}

        {/* TABLA DE INGRESO PRODUCTO */}
        <div className="overflow-x-auto mb-8 border-2 border-gray-800 shadow-sm">
          <table className="w-full border-collapse min-w-[900px]">
            <thead className="bg-gray-800 text-white text-[10px] font-black uppercase">
              <tr>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 w-24 text-center">Calif.</th>
                <th className="p-2 w-40 text-center">Unidad de Medida</th> {/* Ancho aumentado */}
                <th className="p-2 w-28 text-center">Cantidad</th>
                <th className="p-2 w-28 text-center">Precio U.</th>
                <th className="p-2 w-24 text-center">Prima</th>
                <th className="p-2 w-20 text-center">IVA %</th>
                <th className="p-2 text-right w-36">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-black font-black uppercase">
              <tr className="border-b border-gray-800">
                <td className="p-2 border-r border-gray-800">
                  <select
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                    className="w-full p-2 outline-none text-xs font-black bg-white"
                  >
                    <option value="">-- SELECCIONAR --</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border-r border-gray-800">
                  <input
                    type="text"
                    value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value.toUpperCase())}
                    className="w-full text-center outline-none bg-gray-50 p-2 text-xs"
                    placeholder="---"
                  />
                </td>
                <td className="p-2 border-r border-gray-800">
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    className="w-full p-2 text-center outline-none bg-white font-black text-xs"
                  >
                    <option value="Quintales">QUINTALES (QQ)</option>
                    <option value="Kilogramos">KILOGRAMOS (KG)</option>
                    <option value="Libras">LIBRAS (LB)</option>
                    <option value="Unidades">UNIDADES (U)</option>
                  </select>
                </td>
                <td className="p-2 border-r border-gray-800">
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2 bg-yellow-50"
                  />
                </td>
                <td className="p-2 border-r border-gray-800">
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2 bg-gray-50"
                  />
                </td>
                <td className="p-2 border-r border-gray-800">
                  <input
                    type="number"
                    value={prima}
                    onChange={(e) => setPrima(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2"
                  />
                </td>
                <td className="p-2 border-r border-gray-800">
                  <input
                    type="number"
                    value={ivaPorcentaje}
                    onChange={(e) => setIvaPorcentaje(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2"
                  />
                </td>
                <td className="p-4 text-right font-mono text-2xl bg-gray-100">
                  ${parcial.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ... (Resto del código de Retenciones y Pagos se mantiene igual) ... */}

        {/* RETENCIONES Y PAGOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-gray-800 p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
            <p className="text-[11px] font-black uppercase border-b-2 border-gray-800 pb-2 flex items-center gap-2">
              <MdMoneyOff size={18} className="text-red-600" /> Retención en la Fuente
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">
                  Concepto de Retención
                </label>
                <input
                  type="text"
                  placeholder="EJ. COMPRA DE BIENES ORIGEN AGRÍCOLA 1.75%"
                  value={retencionConcepto}
                  onChange={(e) => setRetencionConcepto(e.target.value.toUpperCase())}
                  className="w-full border-2 border-gray-800 p-2.5 text-xs font-bold outline-none focus:bg-gray-50"
                />
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1 w-1/3">
                  <label className="text-[10px] font-black uppercase text-gray-500">
                    Porcentaje %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={retencionPorcentaje}
                      onChange={(e) => setRetencionPorcentaje(e.target.value)}
                      className="w-full border-2 border-gray-800 p-2 font-mono font-black text-xl outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 font-black">%</span>
                  </div>
                </div>
                <div className="flex-1 text-right bg-gray-50 p-2 border border-dashed border-gray-300">
                  <span className="text-[10px] font-black uppercase text-gray-500 block">
                    Total a Descontar:
                  </span>
                  <span className="text-2xl font-mono font-black text-red-600">
                    -${valorRetenido.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-4 border-gray-800 p-5 bg-gray-50 shadow-md">
            <div className="flex justify-between font-black text-3xl uppercase border-b-4 border-gray-800 mb-6 pb-2 italic">
              <span>Total a Pagar:</span>
              <span className="text-4xl">${totalAPagar.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <div className="border-2 border-red-600 p-2 bg-white">
                <label className="text-[9px] font-black uppercase block text-red-600">
                  Descuento
                </label>
                <input
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  className="w-full font-mono font-black text-lg outline-none text-red-600"
                />
              </div>
              <div className="border-2 border-gray-800 p-2 bg-white">
                <label className="text-[9px] font-black uppercase block">Efectivo</label>
                <input
                  type="number"
                  value={pagos.efectivo}
                  onChange={(e) => setPagos({ ...pagos, efectivo: e.target.value })}
                  className="w-full font-mono font-black text-lg outline-none"
                />
              </div>
              <div className="border-2 border-gray-800 p-2 bg-white">
                <label className="text-[9px] font-black uppercase block">Cheque</label>
                <input
                  type="number"
                  value={pagos.cheque}
                  onChange={(e) => setPagos({ ...pagos, cheque: e.target.value })}
                  className="w-full font-mono font-black text-lg outline-none"
                />
              </div>
              <div className="border-2 border-gray-800 p-2 bg-white">
                <label className="text-[9px] font-black uppercase block">Transf.</label>
                <input
                  type="number"
                  value={pagos.transferencia}
                  onChange={(e) => setPagos({ ...pagos, transferencia: e.target.value })}
                  className="w-full font-mono font-black text-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white border-2 border-gray-800 p-3 text-center">
                <p className="text-[9px] font-black uppercase text-gray-400">Total Pagado</p>
                <p className="text-2xl font-mono font-black">${montoAbonado.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 text-white p-3 text-center">
                <p className="text-[9px] font-black uppercase text-gray-400 text-center w-full">
                  Saldo
                </p>
                <p className="text-2xl font-mono font-black text-yellow-400">
                  ${saldoADeber.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={handleGuardar}
              className={`w-full bg-gray-900 text-white font-black py-5 uppercase text-sm hover:bg-black transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MdPayments size={20} /> {loading ? 'PROCESANDO...' : 'Guardar Liquidación de Compra'}
            </button>
          </div>
        </div>

        {/* ... (Historial de Liquidaciones se mantiene igual) ... */}

        {/* SECCIÓN DE HISTORIAL Y FILTROS */}
        <div className="mt-12 border-t-4 border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h3 className="text-xl font-black uppercase italic">Historial de Liquidaciones</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase">
                Consulta y gestión de compras realizadas
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
              <div className="flex flex-col">
                <label className="text-[9px] font-black uppercase ml-1">Fecha Inicio</label>
                <input
                  type="date"
                  className="border-2 border-gray-800 p-1 text-xs font-bold outline-none focus:bg-yellow-50"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-black uppercase ml-1">Productor</label>
                <select className="border-2 border-gray-800 p-1 text-xs font-bold outline-none focus:bg-yellow-50">
                  <option>TODOS</option>
                  {productores.map((p) => (
                    <option key={p.id}>{p.nombreCompleto}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-black uppercase ml-1">Usuario/Cajero</label>
                <select className="border-2 border-gray-800 p-1 text-xs font-bold outline-none focus:bg-yellow-50">
                  <option>TODOS</option>
                </select>
              </div>
              <button className="bg-gray-800 text-white text-[10px] font-black uppercase px-4 h-[34px] self-end hover:bg-black transition-colors">
                Filtrar Lista
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-gray-800 shadow-sm">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead className="bg-gray-100 border-b-2 border-gray-800 text-[10px] font-black uppercase">
                <tr>
                  <th className="p-3 text-left border-r border-gray-300">Fecha / ID</th>
                  <th className="p-3 text-left border-r border-gray-300">Productor</th>
                  <th className="p-3 text-left border-r border-gray-300">Detalle Producto</th>
                  <th className="p-3 text-center border-r border-gray-300">Cant. / Precio</th>
                  <th className="p-3 text-right border-r border-gray-300">Retención</th>
                  <th className="p-3 text-right border-r border-gray-300">Total Neto</th>
                  <th className="p-3 text-right border-r border-gray-300">Saldo</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold uppercase">
                {liquidaciones.length > 0 ? (
                  liquidaciones.map((liq) => (
                    <tr
                      key={liq.id}
                      className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 border-r border-gray-200">
                        <span className="block font-black text-xs">
                          #{liq.id.toString().padStart(6, '0')}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {new Date(liq.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-3 border-r border-gray-200">
                        <span className="block">{liq.Productor?.nombreCompleto || 'N/A'}</span>
                        <span className="text-[9px] font-normal text-gray-500 italic">
                          Resp: {liq.Usuario?.nombre || 'Admin'}
                        </span>
                      </td>
                      <td className="p-3 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-800 text-white px-1.5 py-0.5 text-[9px] rounded-sm">
                            {liq.DetalleLiquidacion?.unidad}
                          </span>
                          <span>{liq.DetalleLiquidacion?.descripcionProducto}</span>
                        </div>
                      </td>
                      <td className="p-3 border-r border-gray-200 text-center font-mono">
                        <span className="block">
                          {liq.DetalleLiquidacion?.cantidad} x ${liq.DetalleLiquidacion?.precio}
                        </span>
                      </td>
                      <td className="p-3 border-r border-gray-200 text-right text-red-600 font-mono">
                        -${liq.totalRetencion?.toFixed(2)}
                      </td>
                      <td className="p-3 border-r border-gray-200 text-right font-black text-sm font-mono">
                        ${liq.totalAPagar?.toFixed(2)}
                      </td>
                      <td className="p-3 border-r border-gray-200 text-right">
                        {liq.montoPorPagar > 0 ? (
                          <span className="text-orange-600 font-black font-mono">
                            ${liq.montoPorPagar.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-green-600 font-black">PAGADO</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            className="p-2 bg-gray-100 border border-gray-800 hover:bg-gray-800 hover:text-white transition-all rounded-sm"
                            title="Imprimir Comprobante"
                          >
                            <MdPrint size={16} />
                          </button>
                          <button
                            className="p-2 bg-red-50 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-sm"
                            title="Anular"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-gray-400 italic">
                      No se han registrado liquidaciones hoy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Compras
