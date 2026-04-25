import { useEffect, useMemo, useState } from 'react'
import {
  MdChevronLeft,
  MdChevronRight,
  MdEdit,
  MdErrorOutline,
  MdEventRepeat,
  MdFilterList,
  MdOutlineAccountBalanceWallet,
  MdPrint,
  MdReceiptLong,
  MdWarning,
} from 'react-icons/md'
import { Container } from '../../components/index.components'
import { usePrestamos } from '../../hooks/usePrestamos'
import { useEmpresaStore } from '../../store/useEmpresaStore'
import { formatFecha, formatMoney } from '../../utils/fromatters'
import { exportarPrestamoPDF } from '../../utils/prestamoReport'

const Prestamos = () => {
  const {
    loading,
    empleadoInfo,
    cedulaBusqueda,
    setCedulaBusqueda,
    montoTotal,
    setMontoTotal,
    cuotasPactadas,
    setCuotasPactadas,
    comentario,
    setComentario,
    handleGuardarPrestamo,
    prestamosGlobales,
    caja,
    error,
    trabajadoresFiltrados,
    mostrarSugerencias,
    setMostrarSugerencias,
    seleccionarEmpleado,
    saldoDeudaEmpleado,
    prepararEdicion,
    isEdit,
  } = usePrestamos()

  const empresa = useEmpresaStore((state) => state.empresa)
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const montoCuotaSugerido = useMemo(() => {
    if (!montoTotal || !cuotasPactadas || cuotasPactadas <= 0) return 0
    return parseFloat(montoTotal) / parseInt(cuotasPactadas)
  }, [montoTotal, cuotasPactadas])

  const prestamosFiltrados = useMemo(() => {
    const termino = cedulaBusqueda.trim().toLowerCase()
    return prestamosGlobales.filter((pres) => {
      const nombre = (pres.Persona?.nombreCompleto || '').toLowerCase()
      const cedula = (pres.Persona?.numeroIdentificacion || '').toLowerCase()
      const matchTexto =
        termino === '' ? true : nombre.includes(termino) || cedula.includes(termino)
      const matchEstado = filtroEstado === 'Todos' ? true : pres.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [prestamosGlobales, cedulaBusqueda, filtroEstado])

  useEffect(() => {
    setCurrentPage(1)
  }, [cedulaBusqueda, filtroEstado])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = prestamosFiltrados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(prestamosFiltrados.length / itemsPerPage)

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
              Gestion de Ventas
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Aroma de Oro | Flujo de Caja
            </p>
          </div>

          {/* WIDGET DE SALDO - COLORES AROMA DE ORO */}
          <div
            className={`flex items-center gap-5 p-2 pr-6 rounded-[2rem] border transition-all shadow-sm self-center ${
              caja && caja.estado === 'Abierta'
                ? 'bg-white border-gray-100'
                : 'bg-rose-50 border-rose-100'
            }`}
          >
            {/* Icono con el ámbar de la marca */}
            <div
              className={`p-3.5 rounded-[1.5rem] ${
                caja && caja.estado === 'Abierta'
                  ? 'bg-gray-900 text-amber-400 shadow-lg shadow-amber-400/20'
                  : 'bg-rose-100 text-rose-600'
              }`}
            >
              <MdOutlineAccountBalanceWallet size={20} />
            </div>

            {/* Información de Saldo */}
            <div className="flex flex-col justify-center border-r border-gray-100 pr-5">
              <p
                className={`text-[10px] font-black uppercase tracking-tighter leading-none mb-1 ${
                  caja && caja.estado === 'Abierta' ? 'text-gray-400' : 'text-rose-400'
                }`}
              >
                {caja && caja.estado === 'Abierta' ? 'Saldo en Caja' : 'Caja Cerrada'}
              </p>
              {caja && caja.estado === 'Abierta' ? (
                <p
                  className={`text-xl font-black font-mono tracking-tighter leading-none text-gray-900 `}
                >
                  {formatMoney(caja.saldoActual)}
                </p>
              ) : (
                <p
                  className={`text-xl font-black font-mono tracking-tighter leading-none text-rose-600 text-center`}
                >
                  -----
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                <MdReceiptLong className="text-amber-500" size={28} />
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter italic">
                  {isEdit ? 'Corregir crédito' : 'Nuevo crédito'}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Empleado (Nombre o Cédula)
                  </label>
                  <input
                    type="text"
                    value={cedulaBusqueda}
                    onChange={(e) => {
                      setCedulaBusqueda(e.target.value)
                      setMostrarSugerencias(true)
                    }}
                    placeholder="BUSCAR..."
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 uppercase transition-all"
                  />
                  {mostrarSugerencias && trabajadoresFiltrados.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-2xl mt-2 shadow-2xl max-h-60 overflow-y-auto">
                      {trabajadoresFiltrados.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => seleccionarEmpleado(t)}
                          className="p-4 border-b border-gray-50 hover:bg-amber-50 cursor-pointer"
                        >
                          <p className="text-xs font-black text-gray-800 uppercase">
                            {t.nombreCompleto}
                          </p>
                          <p className="text-[9px] text-gray-400 font-mono mt-1">
                            {t.numeroIdentificacion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {empleadoInfo ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div
                      className={`p-5 rounded-[2rem] border-2 border-dashed ${saldoDeudaEmpleado > 0 ? 'bg-rose-50 border-rose-200' : 'bg-gray-900 border-gray-800 shadow-xl'}`}
                    >
                      <p
                        className={`text-[9px] font-black uppercase mb-1 tracking-widest text-center ${saldoDeudaEmpleado > 0 ? 'text-rose-400' : 'text-amber-400'}`}
                      >
                        Empleado Seleccionado
                      </p>
                      <p
                        className={`text-sm font-black uppercase leading-tight italic text-center ${saldoDeudaEmpleado > 0 ? 'text-gray-800' : 'text-white'}`}
                      >
                        {empleadoInfo.nombreCompleto}
                      </p>
                      <div
                        className={`flex justify-between mt-4 pt-4 border-t ${saldoDeudaEmpleado > 0 ? 'border-rose-200' : 'border-gray-700'}`}
                      >
                        <span
                          className={`text-[10px] font-black uppercase ${saldoDeudaEmpleado > 0 ? 'text-rose-400' : 'text-gray-400'}`}
                        >
                          Deuda Activa
                        </span>
                        <span
                          className={`text-xs font-black font-mono ${saldoDeudaEmpleado > 0 ? 'text-rose-600' : 'text-emerald-400'}`}
                        >
                          ${saldoDeudaEmpleado.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {saldoDeudaEmpleado > 0 ? (
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3 items-center">
                        <MdWarning className="text-amber-600" size={24} />
                        <p className="text-[9px] font-black text-amber-800 uppercase leading-tight">
                          Este empleado ya tiene un préstamo activo. Bloqueado hasta cancelar deuda.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                              Monto Total
                            </label>
                            <input
                              type="number"
                              value={montoTotal}
                              onChange={(e) => setMontoTotal(e.target.value)}
                              className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none shadow-inner"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                              Cuotas
                            </label>
                            <input
                              type="number"
                              value={cuotasPactadas}
                              onChange={(e) => setCuotasPactadas(e.target.value)}
                              className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none shadow-inner"
                            />
                          </div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 border-dashed flex justify-between items-center">
                          <div className="flex items-center gap-2 text-amber-600">
                            <MdEventRepeat size={18} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Pago sugerido:
                            </span>
                          </div>
                          <span className="text-lg font-black text-gray-800 font-mono">
                            ${montoCuotaSugerido.toFixed(2)}
                          </span>
                        </div>
                        <textarea
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="MOTIVO / DESCRIPCIÓN"
                          rows="2"
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none resize-none shadow-inner uppercase"
                        />
                        <button
                          onClick={handleGuardarPrestamo}
                          disabled={loading || !montoTotal || !cuotasPactadas || !comentario}
                          className="w-full py-5 bg-gray-900 text-amber-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all italic"
                        >
                          {loading
                            ? 'PROCESANDO...'
                            : isEdit
                              ? 'GUARDAR CAMBIOS'
                              : 'AUTORIZAR PRÉSTAMO'}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 border-dashed">
                    <MdErrorOutline className="text-gray-300" size={24} />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
                      Busque un empleado para continuar
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <MdFilterList className="text-amber-500" size={20} />
                  <input
                    type="text"
                    placeholder="BUSCAR EMPLEADO O CÉDULA..."
                    value={cedulaBusqueda}
                    onChange={(e) => setCedulaBusqueda(e.target.value)}
                    className="bg-transparent outline-none text-[10px] font-black uppercase text-gray-600 w-full md:w-64 tracking-widest"
                  />
                </div>
                <div className="flex gap-2">
                  {['Todos', 'Pendiente', 'Pagado'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filtroEstado === estado ? 'bg-gray-900 text-amber-400 shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
                    >
                      {estado.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6 text-left">Info Crédito</th>
                      <th className="px-8 py-6 text-left">Empleado</th>
                      <th className="px-8 py-6 text-center">Cuotas / Progreso</th>
                      <th className="px-8 py-6 text-right">Saldo Faltante</th>
                      <th className="px-8 py-6 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentItems.map((pres) => (
                      <tr key={pres.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-[10px] text-gray-400 font-mono mb-1">
                            {formatFecha(pres.createdAt)}
                          </p>
                          <p className="text-sm font-black text-gray-800 leading-none tracking-tighter">
                            ${parseFloat(pres.montoTotal).toFixed(2)}
                          </p>
                          <span className="text-[10px] text-amber-600 font-bold italic tracking-tight lowercase">
                            "{pres.comentario}"
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-gray-800 leading-none uppercase tracking-tighter">
                            {pres.Persona?.nombreCompleto}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1">
                            {pres.Persona?.numeroIdentificacion}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col items-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${pres.estado === 'PENDIENTE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                            >
                              {pres.cuotasPagadas} / {pres.cuotasPactadas} CUOTAS
                            </span>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden border border-gray-50">
                              <div
                                className="h-full bg-amber-400 transition-all shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                style={{
                                  width: `${(pres.cuotasPagadas / pres.cuotasPactadas) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right font-mono text-gray-900 font-black text-base">
                          ${parseFloat(pres.saldoPendiente).toFixed(2)}
                        </td>
                        <td className="px-8 py-5 text-center flex justify-center items-center">
                          <button
                            onClick={() => prepararEdicion(pres)}
                            className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 shadow-md border border-gray-700 transition-all mr-2"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => exportarPrestamoPDF(pres, empresa)}
                            className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 shadow-md border border-gray-700 transition-all"
                          >
                            <MdPrint size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Mostrando{' '}
                  <span className="text-gray-900">
                    {prestamosFiltrados.length > 0 ? indexOfFirstItem + 1 : 0}
                  </span>{' '}
                  a{' '}
                  <span className="text-gray-900">
                    {Math.min(indexOfLastItem, prestamosFiltrados.length)}
                  </span>{' '}
                  de <span className="text-gray-900">{prestamosFiltrados.length}</span> créditos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 transition-all"
                  >
                    <MdChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {[...Array(totalPages)]
                      .map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
                        >
                          {i + 1}
                        </button>
                      ))
                      .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 transition-all"
                  >
                    <MdChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Prestamos

// import { useEffect, useMemo, useState } from 'react'
// import { FaMoneyBillWave } from 'react-icons/fa'
// import {
//   MdAttachMoney,
//   MdChevronLeft,
//   MdChevronRight,
//   MdEdit,
//   MdErrorOutline,
//   MdEventRepeat,
//   MdFilterList,
//   MdGroups,
//   MdOutlineAccountBalanceWallet,
//   MdPersonAddAlt1,
//   MdPrint,
//   MdReceiptLong,
//   MdWarning,
// } from 'react-icons/md'
// import Swal from 'sweetalert2'
// import prestamoAPI from '../../api/prestamo/prestamo.api'
// import { Container, Modal } from '../../components/index.components'
// import { usePrestamos } from '../../hooks/usePrestamos'
// import { useAuthStore } from '../../store/useAuthStore'
// import { useCajaStore } from '../../store/useCajaStore'
// import { useEmpresaStore } from '../../store/useEmpresaStore'
// import { formatFecha, formatMoney } from '../../utils/fromatters'
// import { exportarPrestamoPDF } from '../../utils/prestamoReport'

// const Prestamos = () => {
//   const {
//     loading,
//     empleadoInfo,
//     cedulaBusqueda,
//     setCedulaBusqueda,
//     montoTotal,
//     setMontoTotal,
//     cuotasPactadas,
//     setCuotasPactadas,
//     comentario,
//     setComentario,
//     handleGuardarPrestamo,
//     prestamosGlobales,
//     caja,
//     error,
//     trabajadoresFiltrados,
//     mostrarSugerencias,
//     setMostrarSugerencias,
//     seleccionarEmpleado,
//     saldoDeudaEmpleado,
//     prepararEdicion,
//     isEdit,
//   } = usePrestamos()

//   const empresa = useEmpresaStore((state) => state.empresa)
//   const [filtroEstado, setFiltroEstado] = useState('Todos')
//   const [currentPage, setCurrentPage] = useState(1)
//   const itemsPerPage = 8

//   const usuario = useAuthStore((store) => store.user)
//   const token = useAuthStore((store) => store.token)
//   const setCaja = useCajaStore((store) => store.setCaja)

//   const [isModalTerceroOpen, setIsModalTerceroOpen] = useState(false)
//   const [nombreTercero, setNombreTercero] = useState('')

//   const montoCuotaSugerido = useMemo(() => {
//     if (!montoTotal || !cuotasPactadas || cuotasPactadas <= 0) return 0
//     return parseFloat(montoTotal) / parseInt(cuotasPactadas)
//   }, [montoTotal, cuotasPactadas])

//   const saldoActualCaja = caja?.saldoActual || 0
//   const saldoInsuficiente = parseFloat(montoTotal) > saldoActualCaja

//   const prestamosFiltrados = useMemo(() => {
//     const termino = cedulaBusqueda.trim().toLowerCase()
//     return prestamosGlobales.filter((pres) => {
//       const nombre = (pres.Persona?.nombreCompleto || '').toLowerCase()
//       const cedula = (pres.Persona?.numeroIdentificacion || '').toLowerCase()
//       const comentarioPres = (pres.comentario || '').toLowerCase()

//       const matchTexto =
//         termino === ''
//           ? true
//           : nombre.includes(termino) || cedula.includes(termino) || comentarioPres.includes(termino)

//       const matchEstado = filtroEstado === 'Todos' ? true : pres.estado === filtroEstado
//       return matchTexto && matchEstado
//     })
//   }, [prestamosGlobales, cedulaBusqueda, filtroEstado])

//   useEffect(() => {
//     setCurrentPage(1)
//   }, [cedulaBusqueda, filtroEstado])

//   const indexOfLastItem = currentPage * itemsPerPage
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage
//   const currentItems = prestamosFiltrados.slice(indexOfFirstItem, indexOfLastItem)
//   const totalPages = Math.ceil(prestamosFiltrados.length / itemsPerPage)

//   const closeTerceroModal = () => {
//     setIsModalTerceroOpen(false)
//     setNombreTercero('')
//     setMontoTotal('')
//     setCuotasPactadas('')
//     setComentario('')
//   }

//   const handleGuardarTercero = async (e) => {
//     e.preventDefault()
//     const comentarioFinal = `TERCERO: ${nombreTercero.toUpperCase()} | ${comentario.toUpperCase()}`
//     try {
//       const data = {
//         CajaId: caja.id,
//         UsuarioId: usuario.id,
//         montoTotal: parseFloat(montoTotal),
//         comentario: comentarioFinal,
//       }
//       const res = await prestamoAPI.prestarTercero(token, data)
//       if (res.status === 201) {
//         Swal.fire('Éxito', 'Pŕestamo registrado', 'success')
//         setCaja(res.data.caja)
//         closeTerceroModal()
//       }
//     } catch (error) {
//       const msg = error.response?.data?.message || 'Error al registrar el préstamo'
//       Swal.fire('Error', msg, 'error')
//     }
//   }

//   return (
//     <Container fullWidth={true}>
//       <div className="w-full px-4 md:px-8 py-6">
//         {/* HEADER LIMPIO */}
//         <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
//           <div className="border-l-4 border-amber-400 pl-4">
//             <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-gray-900">
//               Gestion de Ventas
//             </h1>
//             <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
//               Aroma de Oro | Flujo de Caja
//             </p>
//           </div>

//           <div
//             className={`flex items-center gap-5 p-2 pr-6 rounded-[2rem] border transition-all shadow-sm ${
//               caja && caja.estado === 'Abierta'
//                 ? 'bg-white border-gray-100'
//                 : 'bg-rose-50 border-rose-100'
//             }`}
//           >
//             <div
//               className={`p-3.5 rounded-[1.5rem] ${
//                 caja && caja.estado === 'Abierta'
//                   ? 'bg-gray-900 text-amber-400 shadow-lg shadow-amber-400/20'
//                   : 'bg-rose-100 text-rose-600'
//               }`}
//             >
//               <MdOutlineAccountBalanceWallet size={20} />
//             </div>
//             <div className="flex flex-col justify-center border-r border-gray-100 pr-5">
//               <p
//                 className={`text-[10px] font-black uppercase tracking-tighter leading-none mb-1 ${
//                   caja && caja.estado === 'Abierta' ? 'text-gray-400' : 'text-rose-400'
//                 }`}
//               >
//                 {caja && caja.estado === 'Abierta' ? 'Saldo en Caja' : 'Caja Cerrada'}
//               </p>
//               <p
//                 className={`text-xl font-black font-mono tracking-tighter leading-none text-gray-900`}
//               >
//                 {caja && caja.estado === 'Abierta' ? formatMoney(caja.saldoActual) : '-----'}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
//           <div className="lg:col-span-4">
//             <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-6">
//               <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
//                 <MdReceiptLong className="text-amber-500" size={28} />
//                 <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter italic">
//                   {isEdit ? 'Corregir crédito' : 'Nuevo crédito'}
//                 </h2>
//               </div>

//               {/* FORMULARIO EMPLEADOS EXISTENTE */}
//               <div className="space-y-6">
//                 <div className="space-y-2 relative">
//                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
//                     Empleado (Nombre o Cédula)
//                   </label>
//                   <input
//                     type="text"
//                     value={cedulaBusqueda}
//                     onChange={(e) => {
//                       setCedulaBusqueda(e.target.value)
//                       setMostrarSugerencias(true)
//                     }}
//                     placeholder="BUSCAR..."
//                     className="w-full h-12 bg-gray-50 rounded-xl border border-gray-200 px-4 text-xs font-bold outline-none focus:border-amber-400 uppercase transition-all"
//                   />
//                   {mostrarSugerencias && trabajadoresFiltrados.length > 0 && (
//                     <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-2xl mt-2 shadow-2xl max-h-60 overflow-y-auto">
//                       {trabajadoresFiltrados.map((t) => (
//                         <div
//                           key={t.id}
//                           onClick={() => seleccionarEmpleado(t)}
//                           className="p-4 border-b border-gray-50 hover:bg-amber-50 cursor-pointer"
//                         >
//                           <p className="text-xs font-black text-gray-800 uppercase">
//                             {t.nombreCompleto}
//                           </p>
//                           <p className="text-[9px] text-gray-400 font-mono mt-1">
//                             {t.numeroIdentificacion}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {empleadoInfo ? (
//                   <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
//                     <div
//                       className={`p-5 rounded-[2rem] border-2 border-dashed ${saldoDeudaEmpleado > 0 ? 'bg-rose-50 border-rose-200' : 'bg-gray-900 border-gray-800 shadow-xl'}`}
//                     >
//                       <p
//                         className={`text-[9px] font-black uppercase mb-1 tracking-widest text-center ${saldoDeudaEmpleado > 0 ? 'text-rose-400' : 'text-amber-400'}`}
//                       >
//                         Empleado Seleccionado
//                       </p>
//                       <p
//                         className={`text-sm font-black uppercase leading-tight italic text-center ${saldoDeudaEmpleado > 0 ? 'text-gray-800' : 'text-white'}`}
//                       >
//                         {empleadoInfo.nombreCompleto}
//                       </p>
//                       <div
//                         className={`flex justify-between mt-4 pt-4 border-t ${saldoDeudaEmpleado > 0 ? 'border-rose-200' : 'border-gray-700'}`}
//                       >
//                         <span
//                           className={`text-[10px] font-black uppercase ${saldoDeudaEmpleado > 0 ? 'text-rose-400' : 'text-gray-400'}`}
//                         >
//                           Deuda Activa
//                         </span>
//                         <span
//                           className={`text-xs font-black font-mono ${saldoDeudaEmpleado > 0 ? 'text-rose-600' : 'text-emerald-400'}`}
//                         >
//                           ${saldoDeudaEmpleado.toFixed(2)}
//                         </span>
//                       </div>
//                     </div>

//                     {saldoDeudaEmpleado > 0 ? (
//                       <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3 items-center">
//                         <MdWarning className="text-amber-600" size={24} />
//                         <p className="text-[9px] font-black text-amber-800 uppercase leading-tight">
//                           Este empleado ya tiene un préstamo activo. Bloqueado hasta cancelar deuda.
//                         </p>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div className="space-y-2">
//                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
//                               Monto Total
//                             </label>
//                             <input
//                               type="number"
//                               value={montoTotal}
//                               onChange={(e) => setMontoTotal(e.target.value)}
//                               className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none shadow-inner"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
//                               Cuotas
//                             </label>
//                             <input
//                               type="number"
//                               value={cuotasPactadas}
//                               onChange={(e) => setCuotasPactadas(e.target.value)}
//                               className="w-full h-12 bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 text-sm font-black font-mono outline-none shadow-inner"
//                             />
//                           </div>
//                         </div>
//                         <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 border-dashed flex justify-between items-center">
//                           <div className="flex items-center gap-2 text-amber-600">
//                             <MdEventRepeat size={18} />
//                             <span className="text-[9px] font-black uppercase tracking-widest">
//                               Pago sugerido:
//                             </span>
//                           </div>
//                           <span className="text-lg font-black text-gray-800 font-mono">
//                             ${montoCuotaSugerido.toFixed(2)}
//                           </span>
//                         </div>
//                         <textarea
//                           value={comentario}
//                           onChange={(e) => setComentario(e.target.value)}
//                           placeholder="MOTIVO / DESCRIPCIÓN"
//                           rows="2"
//                           className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-2xl p-4 text-xs font-bold outline-none resize-none shadow-inner uppercase"
//                         />
//                         <button
//                           onClick={handleGuardarPrestamo}
//                           disabled={loading || !montoTotal || !cuotasPactadas || !comentario}
//                           className="w-full py-5 bg-gray-900 text-amber-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all italic"
//                         >
//                           {loading
//                             ? 'PROCESANDO...'
//                             : isEdit
//                               ? 'GUARDAR CAMBIOS'
//                               : 'AUTORIZAR PRÉSTAMO'}
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-100 border-dashed">
//                     <MdErrorOutline className="text-gray-300" size={24} />
//                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
//                       Busque un empleado para continuar
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="lg:col-span-8">
//             <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
//               {/* ACCIONES DE TABLA MEJORADAS */}
//               <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
//                 <div className="flex items-center gap-3 w-full md:w-auto">
//                   <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
//                     <MdFilterList className="text-amber-500" size={20} />
//                     <input
//                       type="text"
//                       placeholder="BUSCAR..."
//                       value={cedulaBusqueda}
//                       onChange={(e) => setCedulaBusqueda(e.target.value)}
//                       className="bg-transparent outline-none text-[10px] font-black uppercase text-gray-600 w-full md:w-48 tracking-widest"
//                     />
//                   </div>

//                   {/* BOTÓN TERCEROS RE-UBICADO AQUÍ */}
//                   <button
//                     onClick={() => setIsModalTerceroOpen(true)}
//                     className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:bg-black transition-all shadow-md group relative"
//                     title="PRÉSTAMO A TERCEROS"
//                   >
//                     <MdPersonAddAlt1 size={20} />
//                   </button>
//                 </div>

//                 <div className="flex gap-2">
//                   {['Todos', 'Pendiente', 'Pagado'].map((estado) => (
//                     <button
//                       key={estado}
//                       onClick={() => setFiltroEstado(estado)}
//                       className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filtroEstado === estado ? 'bg-gray-900 text-amber-400 shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
//                     >
//                       {estado.toUpperCase()}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* TABLA DE CONTENIDO */}
//               {/* <div className="overflow-x-auto flex-1">
//                 <table className="min-w-full divide-y divide-gray-100">
//                   <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
//                     <tr>
//                       <th className="px-8 py-6 text-left">Info Crédito</th>
//                       <th className="px-8 py-6 text-left">Empleado / Beneficiario</th>
//                       <th className="px-8 py-6 text-center">Cuotas / Progreso</th>
//                       <th className="px-8 py-6 text-right">Saldo Faltante</th>
//                       <th className="px-8 py-6 text-center">Acción</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-50">
//                     {currentItems.map((pres) => (
//                       <tr key={pres.id} className="hover:bg-amber-50/20 transition-colors">
//                         <td className="px-8 py-5">
//                           <p className="text-[10px] text-gray-400 font-mono mb-1">
//                             {formatFecha(pres.createdAt)}
//                           </p>
//                           <p className="text-sm font-black text-gray-800 leading-none tracking-tighter">
//                             ${parseFloat(pres.montoTotal).toFixed(2)}
//                           </p>
//                           <span className="text-[10px] text-amber-600 font-bold italic tracking-tight lowercase">
//                             "{pres.comentario}"
//                           </span>
//                         </td>
//                         <td className="px-8 py-5">
//                           <p className="text-sm font-black text-gray-800 leading-none uppercase tracking-tighter">
//                             {pres.Persona ? pres.Persona.nombreCompleto : 'TERCERO EXTERNO'}
//                           </p>
//                           <p className="text-[10px] text-gray-400 font-mono mt-1">
//                             {pres.Persona ? pres.Persona.numeroIdentificacion : 'NO REGISTRADO'}
//                           </p>
//                         </td>
//                         <td className="px-8 py-5">
//                           <div className="flex flex-col items-center">
//                             <span
//                               className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${pres.estado === 'PENDIENTE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
//                             >
//                               {pres.cuotasPagadas} / {pres.cuotasPactadas} CUOTAS
//                             </span>
//                             <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden border border-gray-50">
//                               <div
//                                 className="h-full bg-amber-400 transition-all shadow-[0_0_8px_rgba(251,191,36,0.5)]"
//                                 style={{
//                                   width: `${(pres.cuotasPagadas / pres.cuotasPactadas) * 100}%`,
//                                 }}
//                               ></div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-8 py-5 text-right font-mono text-gray-900 font-black text-base">
//                           ${parseFloat(pres.saldoPendiente).toFixed(2)}
//                         </td>
//                         <td className="px-8 py-5 text-center flex justify-center items-center">
//                           <button
//                             onClick={() => prepararEdicion(pres)}
//                             className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 shadow-md border border-gray-700 transition-all mr-2"
//                           >
//                             <MdEdit size={18} />
//                           </button>
//                           <button
//                             onClick={() => exportarPrestamoPDF(pres, empresa)}
//                             className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 shadow-md border border-gray-700 transition-all"
//                           >
//                             <MdPrint size={18} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div> */}
//               <div className="overflow-x-auto flex-1">
//                 <table className="min-w-full divide-y divide-gray-100">
//                   <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
//                     <tr>
//                       <th className="px-8 py-6 text-left">Info Crédito</th>
//                       <th className="px-8 py-6 text-left">Beneficiario / Empleado</th>
//                       <th className="px-8 py-6 text-center">Estado / Cuotas</th>
//                       <th className="px-8 py-6 text-right">Saldo Pendiente</th>
//                       <th className="px-8 py-6 text-center">Acción</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-50">
//                     {currentItems.map((pres) => {
//                       // Lógica para extraer el nombre del tercero si es necesario
//                       const obtenerNombreTercero = (txt) => {
//                         if (!txt) return 'EXTERNO'
//                         const partes = txt.split('|')[0].split(':')
//                         return partes[1] ? partes[1].trim() : 'EXTERNO'
//                       }

//                       const esTercero = !pres.Persona
//                       const nombreMostrar = !esTercero
//                         ? pres.Persona.nombreCompleto
//                         : obtenerNombreTercero(pres.comentario)

//                       return (
//                         <tr key={pres.id} className="hover:bg-amber-50/20 transition-colors">
//                           {/* INFO CRÉDITO */}
//                           <td className="px-8 py-5">
//                             <p className="text-[10px] text-gray-400 font-mono mb-1">
//                               {formatFecha(pres.createdAt)}
//                             </p>
//                             <p className="text-sm font-black text-gray-800 leading-none tracking-tighter">
//                               ${parseFloat(pres.montoTotal).toFixed(2)}
//                             </p>
//                             <span className="text-[9px] text-amber-600 font-bold italic tracking-tight lowercase block mt-1 max-w-[150px] truncate">
//                               {pres.comentario}
//                             </span>
//                           </td>

//                           {/* BENEFICIARIO */}
//                           <td className="px-8 py-5">
//                             <p className="text-sm font-black text-gray-800 leading-none uppercase tracking-tighter">
//                               {nombreMostrar}
//                             </p>
//                             <p
//                               className={`text-[10px] font-mono mt-1 ${esTercero ? 'text-amber-500 font-bold' : 'text-gray-400'}`}
//                             >
//                               {esTercero ? 'PRÉSTAMO EXTERNO' : pres.Persona.numeroIdentificacion}
//                             </p>
//                           </td>

//                           {/* PROGRESO / CUOTAS */}
//                           <td className="px-8 py-5">
//                             <div className="flex flex-col items-center">
//                               <span
//                                 className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
//                                   pres.estado === 'PENDIENTE'
//                                     ? 'bg-rose-50 text-rose-600 border-rose-100'
//                                     : 'bg-emerald-50 text-emerald-600 border-emerald-100'
//                                 }`}
//                               >
//                                 {esTercero
//                                   ? 'PAGO ÚNICO'
//                                   : `${pres.cuotasPagadas} / ${pres.cuotasPactadas} CUOTAS`}
//                               </span>

//                               {/* Solo mostrar barra de progreso si no es tercero */}
//                               {!esTercero && (
//                                 <div className="w-24 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
//                                   <div
//                                     className="h-full bg-amber-400 transition-all shadow-[0_0_8px_rgba(251,191,36,0.5)]"
//                                     style={{
//                                       width: `${(pres.cuotasPagadas / pres.cuotasPactadas) * 100}%`,
//                                     }}
//                                   ></div>
//                                 </div>
//                               )}
//                             </div>
//                           </td>

//                           {/* SALDO FALTANTE */}
//                           <td className="px-8 py-5 text-right font-mono text-gray-900 font-black text-base">
//                             ${parseFloat(pres.saldoPendiente).toFixed(2)}
//                           </td>

//                           {/* ACCIONES */}
//                           <td className="px-8 py-5 text-center flex justify-center items-center">
//                             <button
//                               onClick={() => prepararEdicion(pres)}
//                               className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 shadow-md border border-gray-700 transition-all mr-2"
//                               title="Editar"
//                             >
//                               <MdEdit size={16} />
//                             </button>
//                             <button
//                               onClick={() => exportarPrestamoPDF(pres, empresa)}
//                               className="p-3 bg-gray-900 text-amber-400 rounded-xl hover:scale-110 shadow-md border border-gray-700 transition-all"
//                               title="Imprimir"
//                             >
//                               <MdPrint size={16} />
//                             </button>
//                           </td>
//                         </tr>
//                       )
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               {/* PAGINACION EXISTENTE */}
//               <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
//                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                   Mostrando{' '}
//                   <span className="text-gray-900">
//                     {prestamosFiltrados.length > 0 ? indexOfFirstItem + 1 : 0}
//                   </span>{' '}
//                   a{' '}
//                   <span className="text-gray-900">
//                     {Math.min(indexOfLastItem, prestamosFiltrados.length)}
//                   </span>{' '}
//                   de <span className="text-gray-900">{prestamosFiltrados.length}</span> créditos
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setCurrentPage(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 transition-all"
//                   >
//                     <MdChevronLeft size={20} />
//                   </button>
//                   <div className="flex items-center gap-1.5">
//                     {[...Array(totalPages)]
//                       .map((_, i) => (
//                         <button
//                           key={i + 1}
//                           onClick={() => setCurrentPage(i + 1)}
//                           className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-gray-900 text-amber-400 shadow-xl border-b-4 border-amber-600' : 'bg-white border border-gray-200 text-gray-400 hover:border-amber-200'}`}
//                         >
//                           {i + 1}
//                         </button>
//                       ))
//                       .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
//                   </div>
//                   <button
//                     onClick={() => setCurrentPage(currentPage + 1)}
//                     disabled={currentPage === totalPages || totalPages === 0}
//                     className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-20 hover:border-amber-400 transition-all"
//                   >
//                     <MdChevronRight size={20} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Modal
//         isOpen={isModalTerceroOpen}
//         show={isModalTerceroOpen}
//         onClose={closeTerceroModal}
//         title="AUTORIZACIÓN DE CRÉDITO EXTERNO"
//       >
//         <form onSubmit={handleGuardarTercero} className="p-1 space-y-6">
//           {/* 1. INDICADOR DE CAJA - MÁS COMPACTO */}
//           <div
//             className={`p-5 rounded-[1.5rem] flex items-center justify-between border-b-4 shadow-xl relative overflow-hidden group transition-colors ${
//               saldoInsuficiente ? 'bg-rose-900 border-rose-500' : 'bg-gray-900 border-amber-500'
//             }`}
//           >
//             <div className="flex items-center gap-4 relative z-10">
//               <div
//                 className={`${
//                   saldoInsuficiente ? 'bg-rose-500 text-rose-950' : 'bg-amber-400 text-amber-950'
//                 } p-2.5 rounded-xl shadow-lg`}
//               >
//                 <FaMoneyBillWave size={18} />
//               </div>
//               <div>
//                 <p
//                   className={`text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 ${
//                     saldoInsuficiente ? 'text-rose-300' : 'text-amber-500'
//                   }`}
//                 >
//                   {saldoInsuficiente ? '⚠️ SALDO INSUFICIENTE' : 'Disponible en Caja'}
//                 </p>
//                 <p className="text-xl font-black text-white italic font-mono tracking-tighter">
//                   ${saldoActualCaja.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                 </p>
//               </div>
//             </div>
//             <FaMoneyBillWave
//               size={50}
//               className="text-white opacity-5 absolute -right-2 -bottom-2"
//             />
//           </div>

//           {/* 2. VALOR DEL PRÉSTAMO - UN SOLO CAMPO (SIN CUOTAS) */}
//           <div className="space-y-2">
//             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
//               Monto a Prestar ($)
//             </label>
//             <div className="relative">
//               <MdAttachMoney
//                 className={`absolute left-4 top-1/2 -translate-y-1/2 ${
//                   saldoInsuficiente ? 'text-rose-500' : 'text-emerald-500'
//                 }`}
//                 size={24}
//               />
//               <input
//                 type="number"
//                 step="0.01"
//                 required
//                 value={montoTotal}
//                 onChange={(e) => setMontoTotal(e.target.value)}
//                 className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-6 text-2xl font-black font-mono outline-none transition-all shadow-inner ${
//                   saldoInsuficiente
//                     ? 'border-rose-400 text-rose-600 focus:border-rose-600'
//                     : 'border-transparent focus:border-amber-400'
//                 }`}
//                 placeholder="0.00"
//               />
//             </div>
//           </div>

//           {/* 3. BENEFICIARIO */}
//           <div className="space-y-2">
//             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
//               Beneficiario del Crédito
//             </label>
//             <div className="relative">
//               <MdGroups
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
//                 size={22}
//               />
//               <input
//                 type="text"
//                 required
//                 value={nombreTercero}
//                 onChange={(e) => setNombreTercero(e.target.value.toUpperCase())}
//                 className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl py-4 pl-12 px-6 text-xs font-black uppercase outline-none transition-all shadow-inner"
//                 placeholder="NOMBRE COMPLETO DEL TERCERO..."
//               />
//             </div>
//           </div>

//           {/* 4. JUSTIFICACIÓN */}
//           <div className="space-y-2">
//             <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 italic">
//               Justificación
//             </label>
//             <textarea
//               required
//               rows={2}
//               value={comentario}
//               onChange={(e) => setComentario(e.target.value.toUpperCase())}
//               className="w-full bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl py-4 px-5 text-[11px] font-bold uppercase outline-none resize-none transition-all shadow-inner placeholder:text-gray-300"
//               placeholder="MOTIVO DE LA SALIDA DE DINERO..."
//             />
//           </div>

//           {/* 5. FOOTER VERTICAL - AJUSTADO Y SEGURO */}
//           <div
//             className={`p-6 rounded-[2rem] flex flex-col gap-5 shadow-2xl border transition-all ${
//               saldoInsuficiente ? 'bg-rose-950 border-rose-900' : 'bg-gray-900 border-gray-800'
//             }`}
//           >
//             <div className="text-center">
//               <p
//                 className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${
//                   saldoInsuficiente ? 'text-rose-400' : 'text-gray-500'
//                 }`}
//               >
//                 Total a Liquidar
//               </p>
//               <p
//                 className={`text-4xl font-black italic font-mono leading-none tracking-tighter break-all ${
//                   saldoInsuficiente ? 'text-rose-600' : 'text-amber-400'
//                 }`}
//               >
//                 ${parseFloat(montoTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={loading || !montoTotal || !nombreTercero || saldoInsuficiente}
//               className={`w-full py-5 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg transition-all active:scale-[0.97] ${
//                 saldoInsuficiente
//                   ? 'bg-rose-200 text-rose-400 cursor-not-allowed'
//                   : 'bg-amber-400 text-amber-950 hover:bg-amber-300'
//               }`}
//             >
//               {loading ? 'PROCESANDO...' : 'AUTORIZAR DESEMBOLSO'}
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </Container>
//   )
// }

// export default Prestamos
