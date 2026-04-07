import { useState, useMemo, useEffect } from 'react'
import {
  MdBusiness,
  MdSearch,
  MdFactCheck,
  MdErrorOutline,
  MdPersonAdd,
  MdClose,
  MdPrint,
  MdFilterList,
  MdDateRange,
  MdCleaningServices,
  MdSecurity,
  MdChevronLeft,
  MdChevronRight,
  MdRequestPage,
  MdPayments,
  MdAccountBalanceWallet,
  MdOutlineAccountBalanceWallet,
} from 'react-icons/md'
import { Container } from '../../components/index.components'
import { useVentas } from '../../hooks/useVentas'
import { exportarVentaPDF } from '../../utils/ventaReport'
import { formatMoney } from '../../utils/fromatters'

// --- FUNCIÓN HELPER PARA COLOR DE FORMA DE PAGO ---
const getColorPago = (tipo) => {
  if (tipo === 'Contado') return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  if (tipo === 'Crédito') return 'bg-amber-100 text-amber-800 border-amber-300'
  return 'bg-gray-100 text-gray-800'
}

const Ventas = () => {
  const {
    productos,
    ventas,
    empresa,
    caja,
    loading,
    cedulaBusqueda,
    setCedulaBusqueda,
    compradorInfo,
    setCompradorInfo,
    seleccionarComprador,
    mostrarSugerencias,
    setMostrarSugerencias,
    compradoresFiltrados,
    compradores,
    registrarNuevoComprador,

    // Estados del formulario adaptados del nuevo hook
    productoSeleccionado,
    setProductoSeleccionado,
    cantidad,
    setCantidad,
    precio,
    setPrecio,
    unidad,
    setUnidad,
    unidadVenta,
    setUnidadVenta,
    calificacion,
    setCalificacion,
    impurezas,
    setImpurezas,
    retencionConcepto,
    setRetencionConcepto,
    retencionPorcentaje,
    setRetencionPorcentaje,
    pagos,
    setPagos,
    montoAplicarAnticipo,
    setMontoAplicarAnticipo,

    // Acciones y cálculos
    handleFinalizarVenta,
    isFormDisabled,
    deudaAnterior,
    error,

    // Cálculos dinámicos
    pesoNeto,
    bruto,
    valorRetenido,
    totalAPagar,
    montoAbonadoTotal,
    saldoADeber,
    stockExcedido,
    mostrarFormComprador,
    setMostrarFormComprador,
    nuevoComprador,
    setNuevoComprador,
    handleRegistrarComprador,
  } = useVentas()

  // --- ESTADOS LOCALES PARA FILTROS DEL HISTORIAL ---
  const [filtrosHistorial, setFiltrosHistorial] = useState({
    fechaDesde: '',
    fechaHasta: '',
    clienteNombre: '',
    productoId: '',
  })

  // --- ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleGeneratePDF = (venta) => {
    exportarVentaPDF(venta, empresa)
  }

  // --- LÓGICA DE FILTRADO REAL (MEMOIZADA) ---
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const nombreCliente = v.Persona?.nombreCompleto?.toLowerCase() || ''
      const idCliente = v.Persona?.numeroIdentificacion?.toLowerCase() || ''
      const busqueda = filtrosHistorial.clienteNombre.toLowerCase()
      const matchCliente = nombreCliente.includes(busqueda) || idCliente.includes(busqueda)

      const matchProducto = filtrosHistorial.productoId
        ? v.ProductoId?.toString() === filtrosHistorial.productoId.toString()
        : true

      const fechaVenta = new Date(v.createdAt)
      fechaVenta.setHours(0, 0, 0, 0)

      const desde = filtrosHistorial.fechaDesde
        ? new Date(filtrosHistorial.fechaDesde + 'T00:00:00')
        : null
      const hasta = filtrosHistorial.fechaHasta
        ? new Date(filtrosHistorial.fechaHasta + 'T23:59:59')
        : null

      const matchFecha = (!desde || fechaVenta >= desde) && (!hasta || fechaVenta <= hasta)

      return matchCliente && matchProducto && matchFecha
    })
  }, [ventas, filtrosHistorial])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentVentas = ventasFiltradas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(ventasFiltradas.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [filtrosHistorial])

  return (
    <Container fullWidth={true}>
      {/* LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[100] flex items-center justify-center">
          <div className="bg-white p-6 border border-black flex items-center gap-3 shadow-xl rounded-none">
            <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
            <span className="font-black text-xs tracking-widest uppercase">Procesando...</span>
          </div>
        </div>
      )}

      <div className="w-full px-2 md:px-6 py-4 text-gray-800 bg-white font-sans relative uppercase rounded-none">
        {/* CABECERA */}
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

        {error ? (
          <div className="flex flex-col items-center justify-center bg-white py-10 text-center rounded-2xl">
            <div className="bg-rose-50 p-4 rounded-3xl mb-4 border border-rose-100">
              <MdSecurity size={50} className="text-rose-400" />
            </div>
            <h3 className="text-rose-600 font-black uppercase text-sm tracking-[0.2em]">
              Acceso Restringido
            </h3>
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase max-w-xs mx-auto leading-relaxed">
              {error}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* BUSCADOR DINÁMICO */}
              <div className="md:col-span-3 relative group">
                <div className="flex border border-gray-800 h-full">
                  <div className="bg-gray-100 border-r border-gray-800 px-4 flex items-center text-[10px] font-black">
                    <MdSearch size={18} />
                  </div>
                  <input
                    disabled={isFormDisabled}
                    type="text"
                    className="w-full p-2 text-md font-bold outline-none uppercase"
                    value={cedulaBusqueda}
                    onChange={(e) => {
                      setCedulaBusqueda(e.target.value)
                      setMostrarSugerencias(true)
                      if (compradorInfo) setCompradorInfo(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const encontrado = compradores.find(
                          (c) =>
                            c.numeroIdentificacion === cedulaBusqueda.trim() ||
                            c.nombreCompleto.toUpperCase() === cedulaBusqueda.toUpperCase()
                        )
                        if (encontrado) {
                          seleccionarComprador(encontrado)
                          setMostrarSugerencias(false)
                        } else {
                          setCompradorInfo(null)
                          setNuevoComprador({
                            ...nuevoComprador,
                            nombreCompleto: isNaN(cedulaBusqueda)
                              ? cedulaBusqueda.toUpperCase()
                              : '',
                            numeroIdentificacion: !isNaN(cedulaBusqueda) ? cedulaBusqueda : '',
                          })
                          setMostrarFormComprador(true)
                          setMostrarSugerencias(false)
                        }
                      }
                    }}
                    placeholder={`INGRESAR NÚMERO O NOMBRE...`}
                  />
                </div>

                {/* LISTA DE SUGERENCIAS */}
                {mostrarSugerencias && compradoresFiltrados.length > 0 && (
                  <div className="absolute z-[110] w-full bg-white border-2 border-black mt-1 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] max-h-60 overflow-y-auto">
                    {compradoresFiltrados.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => seleccionarComprador(c)}
                        className="p-3 border-b border-gray-100 last:border-0 hover:bg-amber-50 cursor-pointer transition-colors"
                      >
                        <p className="text-[11px] font-black text-gray-800 uppercase leading-none">
                          {c.nombreCompleto}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono mt-1 font-bold">
                          ID: {c.numeroIdentificacion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ESTADO DEL COMPRADOR Y DEUDA */}
              <div
                className={`border p-2 flex flex-col justify-center relative transition-all ${compradorInfo ? (deudaAnterior > 0 ? 'border-rose-500 bg-rose-50' : 'border-emerald-500 bg-emerald-50') : 'bg-gray-50 border-gray-200 opacity-60'}`}
              >
                <div
                  className={`border p-2 flex items-center justify-between transition-all ${compradorInfo ? 'border-emerald-500 bg-emerald-50 text-emerald-800 opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <span className="text-xs font-black truncate mr-2">
                    {compradorInfo?.nombreCompleto}
                  </span>
                  {compradorInfo && <MdFactCheck className="text-emerald-600 shrink-0" size={20} />}
                </div>
                {deudaAnterior > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <MdErrorOutline className="text-rose-600" size={12} />
                    <span className="text-[9px] font-black text-rose-600 ">
                      DEUDA: ${deudaAnterior.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* FORMULARIO NUEVO COMPRADOR */}
            {mostrarFormComprador && !compradorInfo && (
              <div className="mb-8 border border-black bg-gray-50 p-5 animate-in fade-in slide-in-from-top-2 duration-300 rounded-none">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <span className="flex items-center gap-2 font-black text-sm text-blue-600 uppercase">
                    <MdPersonAdd size={20} /> Nuevo Comprador
                  </span>
                  <button onClick={() => setMostrarFormComprador(false)}>
                    <MdClose size={22} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-black mb-4">
                  <div className="flex border border-gray-300 bg-white">
                    <select
                      className="bg-gray-100 border-r border-gray-300 px-2 text-[10px] font-black outline-none"
                      value={nuevoComprador.tipoIdentificacion}
                      onChange={(e) =>
                        setNuevoComprador({ ...nuevoComprador, tipoIdentificacion: e.target.value })
                      }
                    >
                      <option value="Cédula">CÉDULA</option>
                      <option value="RUC">RUC</option>
                    </select>
                    <input
                      type="text"
                      placeholder="NÚMERO"
                      className="w-full p-2.5 text-xs outline-none bg-transparent"
                      value={nuevoComprador.numeroIdentificacion}
                      onChange={(e) =>
                        setNuevoComprador({
                          ...nuevoComprador,
                          numeroIdentificacion: e.target.value,
                        })
                      }
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="NOMBRE COMPLETO"
                    className="border border-gray-300 p-2.5 text-xs outline-none bg-white uppercase md:col-span-2"
                    value={nuevoComprador.nombreCompleto}
                    onChange={(e) =>
                      setNuevoComprador({
                        ...nuevoComprador,
                        nombreCompleto: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-black">
                  <input
                    type="text"
                    placeholder="TELÉFONO"
                    className="border border-gray-300 p-2.5 text-xs outline-none bg-white"
                    value={nuevoComprador.telefono}
                    onChange={(e) =>
                      setNuevoComprador({ ...nuevoComprador, telefono: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="DIRECCIÓN"
                    className="border border-gray-300 p-2.5 text-xs outline-none bg-white uppercase"
                    value={nuevoComprador.direccion}
                    onChange={(e) =>
                      setNuevoComprador({
                        ...nuevoComprador,
                        direccion: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <button
                  onClick={handleRegistrarComprador}
                  className="mt-4 bg-black text-white px-6 py-2 text-[10px] font-black uppercase hover:bg-gray-800 rounded-none w-full md:w-auto"
                >
                  Registrar y Seleccionar
                </button>
              </div>
            )}

            {/* SECCIÓN 01: TABLA DE LIQUIDACIÓN */}
            <div className="mb-8">
              <h3 className="text-[11px] font-black bg-gray-800 text-white px-2 py-1 inline-block mb-2 ">
                01. CÁLCULO DE PESO NETO (LIQUIDACIÓN DE VENTA)
              </h3>
              <div className="overflow-x-auto border border-black text-center">
                <table className="w-full border-collapse text-left table-fixed">
                  <thead className="bg-gray-100 border-b border-black text-[10px] font-black uppercase text-center">
                    <tr>
                      <th className="p-3 border-r border-black w-[18%] text-left">PRODUCTO</th>
                      <th className="p-3 border-r border-black w-[10%]">U. BODEGA</th>
                      <th className="p-3 border-r border-black w-[10%]">U. VENTA</th>
                      <th className="p-3 border-r border-black w-[10%] bg-yellow-50">P. BRUTO</th>
                      <th className="p-3 border-r border-black w-[8%] text-blue-600">CALIF %</th>
                      <th className="p-3 border-r border-black w-[8%] text-red-600">IMPUR %</th>
                      <th className="p-3 border-r border-black w-[12%] bg-emerald-50">PESO NETO</th>
                      <th className="p-3 border-r border-black w-[13%] bg-blue-50">PRECIO U.</th>
                      <th className="p-3 text-right bg-gray-800 text-white w-[15%]">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold font-mono  bg-white text-center">
                    <tr className="h-14">
                      <td className="p-2 border-r border-black bg-gray-50 text-left">
                        <select
                          className="w-full bg-transparent outline-none font-black uppercase text-xs"
                          value={productoSeleccionado}
                          onChange={(e) => {
                            setProductoSeleccionado(e.target.value)
                            const producto = productos.find((p) => p.id === e.target.value)
                            setUnidad(producto.unidadMedida)
                          }}
                        >
                          <option value="">-- SELECCIONE --</option>
                          {productos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 border-r border-black">
                        <select
                          className="w-full bg-transparent outline-none font-black uppercase text-[10px] text-center"
                          value={unidad}
                          disabled={true}
                          onChange={(e) => setUnidad(e.target.value)}
                        >
                          <option selected>-----</option>
                          <option value="Quintales">Quintales</option>
                          <option value="Kilogramos">Kilogramos</option>
                          <option value="Libras">Libras</option>
                          <option value="Tacho">Tacho</option>
                        </select>
                      </td>
                      <td className="p-2 border-r border-black">
                        <select
                          className="w-full bg-transparent outline-none font-black uppercase text-[10px] text-center"
                          value={unidadVenta}
                          onChange={(e) => setUnidadVenta(e.target.value)}
                        >
                          <option value="Quintales">Quintales</option>
                          <option value="Kilogramos">Kilogramos</option>
                          <option value="Libras">Libras</option>
                          <option value="Tacho">Tacho</option>
                        </select>
                      </td>
                      <td className="p-0 border-r border-black bg-yellow-50/50">
                        <input
                          type="number"
                          className="w-full h-full text-center outline-none bg-transparent font-black"
                          value={cantidad || ''}
                          onChange={(e) => setCantidad(e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-0 border-r border-black">
                        <input
                          type="number"
                          className="w-full h-full text-center outline-none bg-transparent text-blue-700 font-black"
                          value={calificacion || ''}
                          onChange={(e) => setCalificacion(e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-0 border-r border-black">
                        <input
                          type="number"
                          className="w-full h-full text-center outline-none bg-transparent text-red-700 font-black"
                          value={impurezas || ''}
                          onChange={(e) => setImpurezas(e.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className="p-4 border-r border-black bg-emerald-50 font-black text-emerald-800 text-md">
                        {Number(pesoNeto)}
                      </td>
                      <td className="p-0 border-r border-black bg-blue-50/50">
                        <input
                          type="number"
                          className="w-full h-full text-center outline-none bg-transparent font-black text-blue-800"
                          value={precio || ''}
                          onChange={(e) => setPrecio(e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-4 text-right font-black bg-gray-100">${bruto.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {stockExcedido && (
                <p className="text-[10px] font-black text-red-600 mt-1 animate-pulse">
                  <MdErrorOutline className="inline" /> ¡STOCK INSUFICIENTE EN BODEGA!
                </p>
              )}
            </div>

            {/* SECCIÓN 02: PAGOS Y RESUMEN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="border border-black p-4 bg-gray-50 rounded-none">
                <h3 className="text-[11px] font-black underline  uppercase mb-3">
                  02. FORMA DE PAGO Y RETENCIONES
                </h3>
                <div className="space-y-3">
                  {/* RETENCIÓN */}
                  <div className="bg-white border border-black p-3">
                    <label className="text-[10px] font-black block mb-1.5 text-red-600 uppercase flex items-center gap-1">
                      <MdRequestPage /> Retención SRI
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CONCEPTO"
                        className="w-full border border-gray-200 p-2 text-[10px] font-black outline-none bg-gray-50 uppercase"
                        value={retencionConcepto}
                        onChange={(e) => setRetencionConcepto(e.target.value.toUpperCase())}
                      />
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 min-w-[100px]">
                        <input
                          type="number"
                          className="w-full text-center font-black outline-none bg-transparent"
                          value={retencionPorcentaje || ''}
                          onChange={(e) => setRetencionPorcentaje(e.target.value)}
                        />
                        <span className="font-black text-xs">%</span>
                      </div>
                    </div>
                  </div>

                  {/* DESGLOSE DE PAGOS */}
                  <div className="bg-white border border-black p-3">
                    <label className="text-[10px] font-black block mb-1.5 text-blue-700 uppercase flex items-center gap-1">
                      <MdPayments /> Pagos de hoy (Caja/Bancos)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black">EFECTIVO</span>
                        <input
                          type="number"
                          className="border border-gray-200 p-2 text-[11px] font-black outline-none"
                          value={pagos.efectivo || ''}
                          onChange={(e) => setPagos({ ...pagos, efectivo: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black">TRANSF.</span>
                        <input
                          type="number"
                          className="border border-gray-200 p-2 text-[11px] font-black outline-none"
                          value={pagos.transferencia || ''}
                          onChange={(e) => setPagos({ ...pagos, transferencia: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black">CHEQUE</span>
                        <input
                          type="number"
                          className="border border-gray-200 p-2 text-[11px] font-black outline-none"
                          value={pagos.cheque || ''}
                          onChange={(e) => setPagos({ ...pagos, cheque: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-black p-3">
                    <label className="text-[10px] font-black block mb-1.5 text-purple-700 uppercase">
                      (-) Aplicar Anticipo previo
                    </label>
                    <input
                      type="number"
                      className="w-full text-xl font-black outline-none bg-transparent"
                      value={montoAplicarAnticipo || ''}
                      onChange={(e) => setMontoAplicarAnticipo(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* RESUMEN FINANCIERO */}
              <div className="border border-black flex flex-col bg-white">
                <div className="p-4 flex-grow space-y-2.5 text-[11px] font-black uppercase">
                  <div className="flex justify-between">
                    <span>TOTAL MERCADERÍA:</span>
                    <span>${bruto.toFixed(2)}</span>
                  </div>
                  {valorRetenido > 0 && (
                    <div className="flex justify-between text-red-600 ">
                      <span>(-) VALOR RETENIDO:</span>
                      <span>-${valorRetenido.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-purple-600 ">
                    <span>(-) ABONO POR ANTICIPO:</span>
                    <span>-${parseFloat(montoAplicarAnticipo || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-blue-600 ">
                    <span>(+) DEUDA ANTERIOR:</span>
                    <span>${deudaAnterior.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-black pt-2 font-black text-sm">
                    <span>TOTAL A COBRAR:</span>
                    <span>${totalAPagar.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 ">
                    <span>(-) PAGOS RECIBIDOS HOY:</span>
                    <span>-${montoAbonadoTotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-black pt-2.5">
                    <div className="flex justify-between text-2xl font-black bg-gray-800 text-white p-3.5 mt-1">
                      <span className="text-xs self-center tracking-widest  uppercase">
                        Saldo Pendiente:
                      </span>
                      <span>${saldoADeber.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  disabled={isFormDisabled || !compradorInfo || stockExcedido}
                  onClick={handleFinalizarVenta}
                  className="bg-black text-white p-4 font-black text-sm hover:bg-gray-800 disabled:opacity-20 flex items-center justify-center gap-2 border-t border-black rounded-none transition-all active:scale-95"
                >
                  <MdFactCheck size={20} /> Emitir Factura de Venta
                </button>
              </div>
            </div>

            {/* HISTORIAL DE VENTAS */}
            <div className="mt-12 border-t-2 border-black/10 pt-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black  uppercase flex items-center gap-2">
                  <MdFilterList /> Historial de Despachos
                </h3>
                <button
                  onClick={() =>
                    setFiltrosHistorial({
                      fechaDesde: '',
                      fechaHasta: '',
                      clienteNombre: '',
                      productoId: '',
                    })
                  }
                  className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-black border border-dashed border-gray-300 px-2 py-1"
                >
                  <MdCleaningServices /> Limpiar Filtros
                </button>
              </div>

              {/* FILTROS */}
              <div className="bg-gray-100 border border-gray-800 p-3 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="flex items-center border border-gray-300 bg-white md:col-span-1">
                  <MdDateRange className="mx-2 text-gray-400" />
                  <input
                    type="date"
                    value={filtrosHistorial.fechaDesde}
                    onChange={(e) =>
                      setFiltrosHistorial({ ...filtrosHistorial, fechaDesde: e.target.value })
                    }
                    className="p-2 text-xs font-black outline-none w-full bg-transparent"
                  />
                  <input
                    type="date"
                    value={filtrosHistorial.fechaHasta}
                    onChange={(e) =>
                      setFiltrosHistorial({ ...filtrosHistorial, fechaHasta: e.target.value })
                    }
                    className="p-2 text-xs font-black outline-none border-l w-full bg-transparent"
                  />
                </div>
                <div className="flex items-center border border-gray-300 bg-white md:col-span-2">
                  <MdSearch className="mx-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="BUSCADOR RÁPIDO..."
                    value={filtrosHistorial.clienteNombre}
                    onChange={(e) =>
                      setFiltrosHistorial({ ...filtrosHistorial, clienteNombre: e.target.value })
                    }
                    className="p-2 text-xs font-black outline-none w-full bg-transparent uppercase"
                  />
                </div>
                <div className="border border-gray-300 bg-white">
                  <select
                    value={filtrosHistorial.productoId}
                    onChange={(e) =>
                      setFiltrosHistorial({ ...filtrosHistorial, productoId: e.target.value })
                    }
                    className="w-full p-2 text-xs font-black outline-none cursor-pointer bg-transparent uppercase"
                  >
                    <option value="">-- POR PRODUCTO --</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TABLA HISTORIAL */}
              <div className="border border-black overflow-hidden bg-white shadow-inner">
                <table className="w-full text-[10px] font-bold table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-800 text-white uppercase text-left">
                    <tr>
                      <th className="p-3 w-[12%] border-r border-gray-700">CÓDIGO</th>
                      <th className="p-3 w-[12%] border-r border-gray-700 text-center">FECHA</th>
                      <th className="p-3 w-[22%] border-r border-gray-700">COMPRADOR</th>
                      <th className="p-3 w-[18%] border-r border-gray-700">PRODUCTO</th>
                      <th className="p-3 text-center border-r border-gray-700 w-[12%] bg-emerald-900/40 text-emerald-100">
                        PESO NETO
                      </th>
                      <th className="p-3 text-right border-r border-gray-700 w-[12%]">PRECIO</th>
                      <th className="p-3 text-right border-r border-gray-700 w-[14%] bg-gray-900/50">
                        TOTAL
                      </th>
                      <th className="p-3 w-[12%] border-r border-gray-700 text-center">PAGO</th>
                      <th className="p-3 text-right border-r border-gray-700 w-[14%] text-red-300 bg-red-950/20">
                        SALDO
                      </th>
                      <th className="p-3 text-center w-[12%]">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentVentas.length > 0 ? (
                      currentVentas.map((v) => {
                        const pendiente = parseFloat(v.montoPendiente || 0)
                        const efectivo = parseFloat(v.pagoEfectivo || 0)
                        const transferencia = parseFloat(v.pagoTransferencia || 0)

                        return (
                          <tr
                            key={v.id}
                            className="h-11 hover:bg-gray-100 transition-colors bg-white"
                          >
                            <td className="p-3 font-black border-r border-gray-100">
                              {v.codigoVenta || v.numeroFactura || v.id.slice(0, 8)}
                            </td>
                            <td className="p-3 text-center font-mono border-r border-gray-100 text-gray-600">
                              {new Date(v.createdAt).toLocaleDateString('es-EC')}
                            </td>
                            <td className="p-3 truncate border-r border-gray-100 font-black">
                              {v.Persona?.nombreCompleto || '-- ANÓNIMO --'}
                            </td>
                            <td className="p-3 truncate border-r border-gray-100 uppercase">
                              {v.Producto?.nombre}
                            </td>
                            <td className="p-3 text-center font-mono font-black border-r border-gray-100 text-emerald-800 bg-emerald-50">
                              {parseFloat(v.cantidadNeta).toFixed(2)} QQ
                            </td>
                            <td className="p-3 text-right font-mono border-r border-gray-100">
                              ${parseFloat(v.precioUnitario).toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-black border-r border-gray-100 bg-gray-50">
                              ${parseFloat(v.totalFactura).toFixed(2)}
                            </td>

                            {/* COLUMNA PAGO CORREGIDA */}
                            <td className="p-2 text-center border-r border-gray-100">
                              <div className="flex flex-col gap-0.5 items-center">
                                {pendiente > 0 && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-black uppercase border border-red-600 text-red-600 bg-red-50">
                                    CRÉDITO
                                  </span>
                                )}
                                <div className="flex gap-1">
                                  {efectivo > 0 && (
                                    <span className="px-1 py-0.5 text-[8px] font-black uppercase border border-emerald-600 text-emerald-700 bg-emerald-50">
                                      EFEC.
                                    </span>
                                  )}
                                  {transferencia > 0 && (
                                    <span className="px-1 py-0.5 text-[8px] font-black uppercase border border-blue-600 text-blue-700 bg-blue-50">
                                      TRANS.
                                    </span>
                                  )}
                                </div>
                                {/* Backup por si no hay datos de desglose aún */}
                                {efectivo === 0 && transferencia === 0 && pendiente === 0 && (
                                  <span className="px-1 py-0.5 text-[8px] font-black uppercase border border-gray-400 text-gray-400">
                                    CONTADO
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 text-right font-black text-red-700 border-r border-gray-100 bg-red-50">
                              ${pendiente.toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                className="p-1.5 text-blue-600 hover:text-white bg-white hover:bg-blue-600 border border-blue-600 transition-all shadow-sm"
                                onClick={() => handleGeneratePDF(v)}
                              >
                                <MdPrint size={18} />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          className="p-16 text-center text-gray-300 font-black uppercase bg-gray-50 tracking-widest text-xs"
                        >
                          -- NO SE ENCONTRARON REGISTROS --
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 border-x border-b border-black/10 shadow-inner">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-1.5 bg-white border border-black hover:bg-black hover:text-white disabled:opacity-20 transition-all"
                  >
                    <MdChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)]
                      .map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 text-[10px] font-black border border-black transition-all ${currentPage === i + 1 ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                          {i + 1}
                        </button>
                      ))
                      .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="p-1.5 bg-white border border-black hover:bg-black hover:text-white disabled:opacity-20 transition-all"
                  >
                    <MdChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export default Ventas
