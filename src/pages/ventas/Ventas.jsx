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
} from 'react-icons/md'
import { Container } from '../../components/index.components'
import { useVentas } from '../../hooks/useVentas'
import { exportarVentaPDF } from '../../utils/ventaReport'

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
    tipoBusqueda,
    setTipoBusqueda,
    cedulaBusqueda,
    setCedulaBusqueda,
    compradorInfo,
    formData,
    setFormData,
    buscarComprador,
    error,
    handleFinalizarVenta,
    calculos,
    isFormDisabled,
    registrarNuevoComprador,
  } = useVentas()

  // --- ESTADOS LOCALES PARA FILTROS DEL HISTORIAL ---
  const [mostrarFormComprador, setMostrarFormComprador] = useState(false)
  const [filtrosHistorial, setFiltrosHistorial] = useState({
    fechaDesde: '',
    fechaHasta: '',
    clienteNombre: '',
    productoId: '',
  })

  const [nuevoComprador, setNuevoComprador] = useState({
    nombreCompleto: '',
    numeroIdentificacion: '',
    telefono: '',
    direccion: '',
  })

  // --- ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleGeneratePDF = (venta) => {
    exportarVentaPDF(venta, empresa)
  }

  const handleBuscarCliente = async () => {
    if (!cedulaBusqueda) return
    if (!buscarComprador()) {
      setNuevoComprador({ ...nuevoComprador, numeroIdentificacion: cedulaBusqueda })
      setMostrarFormComprador(true)
    } else setMostrarFormComprador(false)
  }

  // --- LÓGICA DE FILTRADO REAL (MEMOIZADA) ---
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      // Filtro Cliente
      const matchCliente = v.Persona?.nombreCompleto
        ?.toLowerCase()
        .includes(filtrosHistorial.clienteNombre.toLowerCase())

      // Filtro Producto
      const matchProducto = filtrosHistorial.productoId
        ? v.ProductoId?.toString() === filtrosHistorial.productoId.toString()
        : true

      // Filtro Fechas (Normalizando a medianoche para comparar solo días)
      const fechaVenta = new Date(v.createdAt).setHours(0, 0, 0, 0)
      const desde = filtrosHistorial.fechaDesde
        ? new Date(filtrosHistorial.fechaDesde).setHours(0, 0, 0, 0)
        : null
      const hasta = filtrosHistorial.fechaHasta
        ? new Date(filtrosHistorial.fechaHasta).setHours(0, 0, 0, 0)
        : null

      const matchFecha = (!desde || fechaVenta >= desde) && (!hasta || fechaVenta <= hasta)

      return matchCliente && matchProducto && matchFecha
    })
  }, [ventas, filtrosHistorial])

  // --- LÓGICA DE PAGINACIÓN ---
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
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-300 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 text-white p-2 rounded">
              <MdBusiness size={30} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">
                {empresa?.nombre || 'AROMA DE ORO'}
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest font-bold mt-1">
                {empresa?.ruc || '0999999999001'} | VENTAS AGRÍCOLAS
              </p>
            </div>
          </div>
          {!error && (
            <div className="border border-gray-800 p-2 bg-gray-50 text-center min-w-[180px]">
              <h2 className="text-[10px] text-gray-400 mb-1 font-black underline italic">Ventas</h2>
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${caja ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
                ></span>
                <p className="text-xs text-emerald-700 font-black">
                  {caja ? `ID CAJA: ${caja.id.slice(0, 8)}` : 'CAJA CERRADA'}
                </p>
              </div>
            </div>
          )}
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
            <span className="text-[8px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full mt-4 font-black uppercase italic">
              Seguridad Aroma de Oro
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-3 flex border border-gray-800">
                <select
                  value={tipoBusqueda}
                  onChange={(e) => setTipoBusqueda(e.target.value)}
                  className="bg-gray-100 border-r border-gray-800 px-3 text-[11px] font-black outline-none cursor-pointer"
                >
                  <option value="Cédula">CÉDULA</option>
                  <option value="RUC">RUC</option>
                </select>
                <input
                  disabled={isFormDisabled}
                  type="text"
                  className="w-full p-2 text-md font-bold outline-none uppercase"
                  value={cedulaBusqueda}
                  onChange={(e) => setCedulaBusqueda(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscarCliente()}
                  placeholder={`INGRESAR NÚMERO DE ${tipoBusqueda.toUpperCase()}...`}
                />
                <button
                  onClick={handleBuscarCliente}
                  className="px-6 bg-gray-800 text-white hover:bg-black transition-colors"
                >
                  <MdSearch size={22} />
                </button>
              </div>
              <div
                className={`border p-2 flex items-center justify-between transition-all ${compradorInfo ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'bg-gray-50 border-gray-200 opacity-60'}`}
              >
                <span className="text-xs font-black truncate mr-2">
                  {compradorInfo?.nombreCompleto || 'Esperando identificación...'}
                </span>
                {compradorInfo && <MdFactCheck className="text-emerald-600 shrink-0" size={20} />}
              </div>
            </div>

            {mostrarFormComprador && !compradorInfo && (
              <div className="mb-8 border border-black bg-gray-50 p-5 animate-in fade-in slide-in-from-top-2 duration-300 rounded-none">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                  <span className="flex items-center gap-2 font-black text-sm text-blue-600 uppercase">
                    <MdPersonAdd size={20} /> Nuevo {tipoBusqueda}
                  </span>
                  <button onClick={() => setMostrarFormComprador(false)}>
                    <MdClose size={22} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-black">
                  <input
                    type="text"
                    placeholder="NOMBRE COMPLETO"
                    className="border border-gray-300 p-2.5 text-xs outline-none focus:border-gray-500 bg-white uppercase"
                    onChange={(e) =>
                      setNuevoComprador({
                        ...nuevoComprador,
                        nombreCompleto: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="TELÉFONO"
                    className="border border-gray-300 p-2.5 text-xs outline-none focus:border-gray-500 bg-white"
                    onChange={(e) =>
                      setNuevoComprador({ ...nuevoComprador, telefono: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="DIRECCIÓN"
                    className="border border-gray-300 p-2.5 text-xs outline-none focus:border-gray-500 bg-white uppercase"
                    onChange={(e) =>
                      setNuevoComprador({
                        ...nuevoComprador,
                        direccion: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <button
                  onClick={() =>
                    registrarNuevoComprador(nuevoComprador).then(
                      (res) => res && setMostrarFormComprador(false)
                    )
                  }
                  className="mt-4 bg-black text-white px-6 py-2 text-[10px] font-black uppercase hover:bg-gray-800 rounded-none"
                >
                  Registrar y Seleccionar
                </button>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-[11px] font-black bg-gray-800 text-white px-2 py-1 inline-block mb-2 italic">
                01. CÁLCULO DE PESO NETO (LIQUIDACIÓN DE VENTA)
              </h3>
              <div className="overflow-x-auto border border-black">
                <table className="w-full border-collapse text-left table-fixed">
                  <thead className="bg-gray-100 border-b border-black text-[10px] font-black uppercase">
                    <tr>
                      <th className="p-3 border-r border-black w-[18%]">PRODUCTO</th>
                      <th className="p-3 border-r border-black w-[12%] text-center">UNIDAD</th>
                      <th className="p-3 border-r border-black w-[10%] text-center bg-yellow-50">
                        P. BRUTO
                      </th>
                      <th className="p-3 border-r border-black w-[8%] text-center text-blue-600">
                        CALIF (%)
                      </th>
                      <th className="p-3 border-r border-black w-[8%] text-center text-red-600">
                        IMPUR (%)
                      </th>
                      <th className="p-3 border-r border-black w-[11%] text-center bg-gray-50">
                        MERMA CALC.
                      </th>
                      <th className="p-3 border-r border-black w-[12%] text-center bg-emerald-50">
                        PESO NETO
                      </th>
                      <th className="p-3 border-r border-black w-[13%] text-center bg-blue-50">
                        PRECIO UNIT.
                      </th>
                      <th className="p-3 text-right bg-gray-800 text-white w-[15%]">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold font-mono italic bg-white divide-y divide-gray-100">
                    {productos.length > 0 ? (
                      <tr className="h-14">
                        <td className="p-2 border-r border-black bg-gray-50">
                          <select
                            className="w-full bg-transparent outline-none font-black uppercase text-xs cursor-pointer"
                            value={formData.ProductoId}
                            onChange={(e) =>
                              setFormData({ ...formData, ProductoId: e.target.value })
                            }
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
                            className="w-full bg-transparent outline-none font-black uppercase text-[11px] cursor-pointer"
                            value={formData.unidad}
                            onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                          >
                            <option value="Quintales">Quintales</option>
                            <option value="Libras">Libras</option>
                            <option value="Kilogramos">Kilogramos</option>
                            <option value="Arroba">Arroba</option>
                            <option value="Unidades">Unidades</option>
                          </select>
                        </td>
                        <td className="p-0 border-r border-black bg-yellow-50/50">
                          <input
                            type="number"
                            className="w-full h-full text-center outline-none bg-transparent font-black text-md"
                            value={formData.cantidad}
                            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-0 border-r border-black">
                          <input
                            type="number"
                            className="w-full h-full text-center outline-none bg-transparent text-blue-700 font-black text-md"
                            value={formData.calificacion}
                            onChange={(e) =>
                              setFormData({ ...formData, calificacion: e.target.value })
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-0 border-r border-black">
                          <input
                            type="number"
                            className="w-full h-full text-center outline-none bg-transparent text-red-700 font-black text-md"
                            value={formData.impurezas}
                            onChange={(e) =>
                              setFormData({ ...formData, impurezas: e.target.value })
                            }
                            placeholder="0"
                          />
                        </td>
                        <td className="p-4 border-r border-black bg-gray-50 text-center font-black text-gray-500 italic">
                          {(
                            (parseFloat(formData.cantidad || 0) *
                              (parseFloat(formData.calificacion || 0) +
                                parseFloat(formData.impurezas || 0))) /
                            100
                          ).toFixed(2)}
                        </td>
                        <td className="p-4 border-r border-black text-center bg-emerald-50 font-black text-emerald-800 text-md">
                          {calculos.cantidadNeta.toFixed(2)}
                        </td>
                        <td className="p-0 border-r border-black bg-blue-50/50">
                          <input
                            type="number"
                            className="w-full h-full text-center outline-none bg-transparent font-black text-blue-800 text-md"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-4 text-right font-black bg-gray-100 text-md">
                          ${calculos.subtotalBruto.toFixed(2)}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="p-10 text-center text-red-500 font-black tracking-widest text-xs"
                        >
                          <MdErrorOutline className="inline mr-2" size={18} /> NO HAY PRODUCTOS
                          CONFIGURADOS
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {calculos.stockExcedido && (
                <p className="text-[10px] font-black text-red-600 mt-1 animate-pulse">
                  <MdErrorOutline className="inline" /> ¡STOCK INSUFICIENTE EN BODEGA!
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="border border-black p-4 bg-gray-50 rounded-none">
                <h3 className="text-[11px] font-black mb-3 underline italic">02. FORMA DE PAGO</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setFormData({ ...formData, esCredito: false })}
                    className={`py-3 text-[11px] font-black border border-black rounded-none ${!formData.esCredito ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                  >
                    CONTADO
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, esCredito: true })}
                    className={`py-3 text-[11px] font-black border border-black rounded-none ${formData.esCredito ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                  >
                    CRÉDITO
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-white border border-black p-3">
                    <label className="text-[10px] font-black block mb-1.5 text-blue-700">
                      (-) ABONO ANTICIPO (POR PRÉSTAMO PREVIO)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg">$</span>
                      <input
                        type="number"
                        className="w-full text-xl font-mono font-black outline-none bg-transparent"
                        value={formData.anticipo || ''}
                        onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {formData.esCredito && (
                    <div className="bg-white border border-dashed border-black p-3 animate-in slide-in-from-top-2 rounded-none">
                      <label className="text-[10px] font-black block mb-1.5 text-gray-600">
                        ABONO DEL DÍA (LO QUE PAGA HOY)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg">$</span>
                        <input
                          type="number"
                          className="w-full text-xl font-mono font-black outline-none bg-transparent"
                          value={formData.abonoManual}
                          onChange={(e) =>
                            setFormData({ ...formData, abonoManual: e.target.value })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-black flex flex-col rounded-none">
                <div className="p-4 flex-grow space-y-2.5 bg-white text-[11px] font-black uppercase">
                  <div className="flex justify-between">
                    <span>TOTAL BRUTO:</span>
                    <span>${calculos.subtotalBruto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-600 italic">
                    <span>(-) ABONO POR ANTICIPO:</span>
                    <span>-${parseFloat(formData.anticipo || 0).toFixed(2)}</span>
                  </div>
                  {formData.esCredito && (
                    <div className="flex justify-between text-amber-700 italic">
                      <span>(-) ABONO DEL DÍA:</span>
                      <span>-${parseFloat(formData.abonoManual || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2.5">
                    <div className="flex justify-between text-2xl font-black bg-gray-800 text-white p-3.5 mt-1">
                      <span className="text-xs self-center tracking-widest italic">
                        SALDO FINAL:
                      </span>
                      <span>
                        $
                        {(
                          calculos.totalFactura -
                          parseFloat(formData.anticipo || 0) -
                          (formData.esCredito ? parseFloat(formData.abonoManual || 0) : 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  disabled={isFormDisabled || !compradorInfo || calculos.stockExcedido}
                  onClick={handleFinalizarVenta}
                  className="bg-black text-white p-4 font-black text-sm hover:bg-gray-800 disabled:opacity-20 uppercase flex items-center justify-center gap-2 active:scale-95 transition-all border-t border-black rounded-none"
                >
                  <MdFactCheck size={20} /> Emitir Factura de Venta
                </button>
              </div>
            </div>

            <div className="mt-12 border-t-2 border-black/10 pt-8 rounded-none">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black italic uppercase flex items-center gap-2">
                  <MdFilterList className="text-gray-500" /> Historial de Despachos y Liquidaciones
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
                  className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-black border border-dashed border-gray-300 px-2 py-1 bg-gray-50 hover:bg-gray-100"
                >
                  <MdCleaningServices /> Limpiar Filtros
                </button>
              </div>

              <div className="bg-gray-100 border border-gray-800 p-3 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3 rounded-none">
                <div className="flex items-center border border-gray-300 bg-white">
                  <div className="px-3 border-r border-gray-200 bg-gray-50 text-gray-500">
                    <MdDateRange size={18} />
                  </div>
                  <input
                    type="date"
                    title="Fecha Desde"
                    value={filtrosHistorial.fechaDesde}
                    onChange={(e) =>
                      setFiltrosHistorial({ ...filtrosHistorial, fechaDesde: e.target.value })
                    }
                    className="p-2 text-xs font-black outline-none w-full bg-transparent"
                  />
                  <input
                    type="date"
                    title="Fecha Hasta"
                    value={filtrosHistorial.fechaHasta}
                    onChange={(e) =>
                      setFiltrosHistorial({ ...filtrosHistorial, fechaHasta: e.target.value })
                    }
                    className="p-2 text-xs font-black outline-none border-l border-gray-200 w-full bg-transparent"
                  />
                </div>
                <div className="flex items-center border border-gray-300 bg-white">
                  <div className="px-3 border-r border-gray-200 bg-gray-50 text-gray-500">
                    <MdSearch size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscador rápido de Cliente..."
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
                    <option value="">-- FILTRAR POR PRODUCTO --</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="bg-gray-800 text-white text-[10px] font-black py-2.5 px-4 hover:bg-black rounded-none flex items-center justify-center gap-2 uppercase">
                  <MdFilterList /> Aplicar Filtros
                </button>
              </div>

              <div className="border border-black overflow-hidden bg-white shadow-inner">
                <table className="w-full text-[10px] font-bold table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-800 text-white uppercase text-left">
                    <tr>
                      <th className="p-3 w-[12%] border-r border-gray-700">CÓDIGO VNT</th>
                      <th className="p-3 w-[12%] border-r border-gray-700 text-center">FECHA</th>
                      <th className="p-3 w-[22%] border-r border-gray-700">CLIENTE / COMPRADOR</th>
                      <th className="p-3 w-[18%] border-r border-gray-700">PRODUCTO / VARIEDAD</th>
                      <th className="p-3 text-center border-r border-gray-700 w-[12%] bg-emerald-900/40">
                        PESO NETO
                      </th>
                      <th className="p-3 text-right border-r border-gray-700 w-[12%]">
                        PRECIO UNIT.
                      </th>
                      <th className="p-3 text-right border-r border-gray-700 w-[14%] bg-gray-900/50">
                        VALOR TOTAL
                      </th>
                      <th className="p-3 w-[12%] border-r border-gray-700 text-center">PAGO</th>
                      <th className="p-3 text-right border-r border-gray-700 w-[14%] text-red-300 bg-red-950/20">
                        SALDO PEND.
                      </th>
                      <th className="p-3 text-center w-[12%]">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 odd:bg-white even:bg-gray-50/50">
                    {currentVentas.length > 0 ? (
                      currentVentas.map((v) => (
                        <tr
                          key={v.id}
                          className="h-11 hover:bg-gray-100 transition-colors bg-white"
                        >
                          <td className="p-3 font-black border-r border-gray-100">
                            {v.codigoVenta || v.numeroFactura}
                          </td>
                          <td className="p-3 text-center font-mono border-r border-gray-100 text-gray-600">
                            {new Date(v.createdAt).toLocaleDateString('es-EC', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })}
                          </td>
                          <td
                            className="p-3 truncate border-r border-gray-100 text-gray-800 font-black"
                            title={v.Persona?.nombreCompleto}
                          >
                            {v.Persona?.nombreCompleto || '-- ANÓNIMO --'}
                          </td>
                          <td
                            className="p-3 truncate border-r border-gray-100 uppercase"
                            title={v.Producto?.nombre}
                          >
                            {v.Producto?.nombre || '-- PRODUCTO ELIMINADO --'}
                          </td>
                          <td className="p-3 text-center font-mono font-black border-r border-gray-100 text-emerald-800 bg-emerald-50 text-[11px]">
                            {parseFloat(v.cantidadNeta).toFixed(2)} QQ
                          </td>
                          <td className="p-3 text-right font-mono border-r border-gray-100 text-gray-600 text-[11px]">
                            ${parseFloat(v.precioUnitario).toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-black font-mono border-r border-gray-100 bg-gray-50 text-md">
                            ${parseFloat(v.totalFactura).toFixed(2)}
                          </td>
                          <td className="p-2 text-center border-r border-gray-100">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-black uppercase border ${getColorPago(v.tipoVenta)}`}
                            >
                              {v.tipoVenta}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black font-mono text-red-700 border-r border-gray-100 text-md bg-red-50">
                            ${parseFloat(v.montoPendiente).toFixed(2)}
                          </td>
                          <td className="p-3 text-center flex items-center justify-center gap-2">
                            <button
                              className="p-1.5 text-blue-600 hover:text-white bg-white hover:bg-blue-600 border border-blue-600 hover:border-transparent transition-all"
                              title="Imprimir Ticket de Venta"
                              onClick={() => handleGeneratePDF(v)}
                            >
                              <MdPrint size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          className="p-16 text-center text-gray-300 font-black italic text-sm tracking-widest uppercase bg-gray-50 border border-black/10"
                        >
                          -- NO SE ENCONTRARON REGISTROS QUE COINCIDAN CON LOS FILTROS --
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN ESTILO INDUSTRIAL */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 border-x border-b border-black/10 shadow-inner">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-1.5 bg-white border border-black hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-white disabled:hover:text-black transition-all"
                  >
                    <MdChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)]
                      .map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 text-[10px] font-black border border-black transition-all ${
                            currentPage === i + 1
                              ? 'bg-black text-white shadow-md'
                              : 'bg-white text-black hover:bg-gray-200'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))
                      .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="p-1.5 bg-white border border-black hover:bg-black hover:text-white disabled:opacity-20 disabled:hover:bg-white disabled:hover:text-black transition-all"
                  >
                    <MdChevronRight size={18} />
                  </button>
                </div>
              )}

              {ventasFiltradas.length > 0 && (
                <div className="p-3 text-[10px] font-black text-gray-500 text-right bg-white border-x border-b border-black/10 uppercase tracking-widest">
                  Mostrando {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, ventasFiltradas.length)} de {ventasFiltradas.length}{' '}
                  despachos
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
