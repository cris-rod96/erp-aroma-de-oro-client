import {
  MdBusiness,
  MdSearch,
  MdPersonAdd,
  MdPayments,
  MdMoneyOff,
  MdAccountBalanceWallet,
  MdReceipt,
  MdClose,
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdSecurity,
  MdOutlineAccountBalanceWallet,
} from 'react-icons/md'
import { ComprasHeader, ComprasTable, Container } from '../../components/index.components'
import { useLiquidacion } from '../../hooks/useLiquidacion'
import { useEffect } from 'react'

const Compras = () => {
  const {
    resetFiltros,
    productos,
    loading,
    empresa,
    caja,
    cedulaBusqueda,
    setCedulaBusqueda,
    productorInfo,
    deudaAnterior,
    mostrarFormProductor,
    setMostrarFormProductor,
    nuevoProductor,
    setNuevoProductor,
    productoSeleccionado,
    setProductoSeleccionado,
    cantidad,
    setCantidad,
    precio,
    setPrecio,
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
    setSelectedLiq,
    setShowModal,
    pesoNeto,
    totalMerma,
    mermaCalificacion,
    mermaImpurezas,
    bruto,
    valorRetenido,
    totalAPagar,
    montoAbonadoTotal,
    saldoADeber,
    isFormDisabled,
    anticiposPendientes,
    montoAplicarAnticipo,
    setMontoAplicarAnticipo,
    buscarProductor,
    handleRegistrarProductor,
    handleGuardar,
    selectedLiq,
    showModal,
    setMostrarSugerencias,
    mostrarSugerencias,
    productoresFiltrados,
    seleccionarProductor,
    unidad,
    setUnidad,
    error,
    filtros,
    setFiltros,
    liquidacionesFiltradas,
    productores,
    unidadPago,
    setUnidadPago,
    setUnidadProductoSeleccionado,
    unidadProductoSeleccionado,
    setNombreProductoSeleccionado,
  } = useLiquidacion()

  const ejecutarRegistro = async () => {
    await handleRegistrarProductor()
    setMostrarFormProductor(false)
  }

  const UNIDADES_INICIALES = {
    Kilogramos: 'KG',
    Libras: 'LB',
    Quintales: 'QQ',
  }

  useEffect(() => {
    console.log(deudaAnterior)
  }, [])

  return (
    <Container fullWidth={true}>
      <div className="w-full px-2 md:px-6 py-4 text-gray-800 bg-white font-sans relative">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
              Gestion de Liquidaciones
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
                  ${caja.saldoActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
            {/* MODAL EXPEDIENTE (REDUCIDO POR ESPACIO, MANTÉN TU LÓGICA) */}
            {showModal && selectedLiq && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
                <div className="bg-white border-[3px] border-black w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
                  {/* HEADER MODAL */}
                  <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex flex-col text-left">
                      <h2 className="text-xl font-black tracking-tighter uppercase">
                        Expediente de Liquidación
                      </h2>
                      <span className="text-[10px] text-amber-400 font-bold italic">
                        REGISTRO ID: {selectedLiq.id}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="hover:rotate-90 transition-transform duration-300 bg-white/10 p-1 rounded"
                    >
                      <MdClose size={32} />
                    </button>
                  </div>

                  <div className="p-8 space-y-8 uppercase font-sans text-left text-black">
                    {/* SECCION 1: DATOS GENERALES */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-2 border-gray-100 pb-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">
                          Código Interno
                        </label>
                        <p className="text-lg font-black">{selectedLiq.codigo}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">
                          Fecha de Registro
                        </label>
                        <p className="font-bold">
                          {new Date(selectedLiq.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <label className="text-[10px] font-black text-gray-400 block mb-1 uppercase">
                          Estado de Pago
                        </label>
                        <span
                          className={`text-xs font-black px-4 py-1 border-2 ${
                            parseFloat(selectedLiq.montoPorPagar) > 0.01
                              ? 'border-orange-500 text-orange-600'
                              : 'border-emerald-500 text-emerald-600'
                          }`}
                        >
                          {parseFloat(selectedLiq.montoPorPagar) > 0.01
                            ? 'SALDO PENDIENTE'
                            : 'CANCELADO TOTAL'}
                        </span>
                      </div>
                    </div>

                    {/* SECCION 2: TABLA TÉCNICA (PRODUCTO) */}
                    <div>
                      <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 uppercase">
                        01. Análisis de Calidad y Peso
                      </h3>
                      <div className="overflow-hidden border-2 border-black">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-50 border-b-2 border-black text-[10px] font-black uppercase">
                            <tr>
                              <th className="p-2 text-left border-r border-black w-[25%] uppercase">
                                Producto
                              </th>
                              <th className="p-2 text-center border-r border-black w-[15%] uppercase">
                                Calif. (%)
                              </th>
                              <th className="p-2 text-center border-r border-black w-[20%] uppercase">
                                Peso Bruto
                              </th>
                              <th className="p-2 text-center border-r border-black w-[20%] text-blue-800 uppercase">
                                Impureza (%)
                              </th>
                              <th className="p-2 text-center text-red-600 w-[20%] uppercase">
                                Desc. Merma
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-bold uppercase">
                            <tr className="border-b border-black">
                              <td className="p-3 border-r border-black">
                                {selectedLiq.DetalleLiquidacion?.descripcionProducto ||
                                  'CACAO SECO'}
                              </td>
                              <td className="p-3 border-r border-black text-center">
                                {selectedLiq.DetalleLiquidacion?.calificacion}%
                              </td>
                              <td className="p-3 border-r border-black text-center font-mono">
                                {selectedLiq.DetalleLiquidacion?.cantidad}{' '}
                                {selectedLiq.DetalleLiquidacion?.unidad}
                              </td>
                              <td className="p-3 border-r border-black text-center font-mono text-blue-800">
                                {selectedLiq.DetalleLiquidacion?.impurezas}%
                              </td>
                              <td className="p-3 text-center text-red-600 font-mono">
                                -
                                {parseFloat(
                                  selectedLiq.DetalleLiquidacion?.descuentoMerma || 0
                                ).toFixed(2)}
                              </td>
                            </tr>
                            <tr className="bg-emerald-50">
                              <td
                                colSpan="3"
                                className="p-2 text-right font-black text-xs border-r border-black uppercase"
                              >
                                Peso Neto a Liquidar:
                              </td>
                              <td
                                colSpan="2"
                                className="p-2 text-center font-black text-emerald-700 font-mono text-lg bg-emerald-100/50"
                              >
                                {parseFloat(
                                  selectedLiq.DetalleLiquidacion?.cantidadNeta || 0
                                ).toFixed(2)}{' '}
                                {selectedLiq.DetalleLiquidacion?.unidad}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* SECCION 3: DESGLOSE FINANCIERO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 uppercase">
                          02. Información del Productor
                        </h3>
                        <div className="border-2 border-black p-4 space-y-2 h-full">
                          <p className="font-black text-lg leading-tight uppercase">
                            {selectedLiq.Persona?.nombreCompleto}
                          </p>
                          <div className="text-[11px] font-bold text-gray-500 space-y-1">
                            <p>Identificación: {selectedLiq.Persona?.numeroIdentificacion}</p>
                            <p>Contacto: {selectedLiq.Persona?.telefono || 'N/A'}</p>
                            <p>Dirección: {selectedLiq.Persona?.direccion || 'S/D'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 uppercase">
                          03. Resumen de Valores
                        </h3>
                        <div className="border-2 border-black divide-y divide-gray-200">
                          <div className="flex justify-between p-2 text-xs font-bold uppercase">
                            <span>Subtotal Producto:</span>
                            <span className="font-mono">
                              ${parseFloat(selectedLiq.totalLiquidacion).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between p-2 text-xs font-bold text-red-600 uppercase">
                            <span>(-) Retención Fuente:</span>
                            <span className="font-mono">
                              -${parseFloat(selectedLiq.totalRetencion).toFixed(2)}
                            </span>
                          </div>

                          {/* ANTICIPOS APLICADOS */}
                          {selectedLiq.Anticipos?.map((ant, index) => (
                            <div
                              key={index}
                              className="flex justify-between p-2 text-[10px] font-black text-amber-700 italic bg-amber-50 uppercase"
                            >
                              <span>(-) Anticipo Aplicado:</span>
                              <span className="font-mono">
                                -$
                                {parseFloat(ant.LiquidacionAnticipo?.montoAplicado || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          {/* PAGO DE DEUDA ANTERIOR (EXTRAÍDO DEL ABONO CXP) */}
                          {selectedLiq.CuentasPorPagars?.[0]?.AbonosCuentasPorPagars?.[0] && (
                            <div className="flex justify-between p-2 text-[10px] font-black text-blue-700 bg-blue-50 uppercase border-t border-gray-100">
                              <span>(+) Pago Deuda Anterior:</span>
                              <span className="font-mono">
                                $
                                {parseFloat(
                                  selectedLiq.CuentasPorPagars[0].AbonosCuentasPorPagars[0].monto
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between p-3 bg-gray-100 font-black text-lg">
                            <span className="italic uppercase">Total Neto a Entregar:</span>
                            <span className="font-mono">
                              ${parseFloat(selectedLiq.totalAPagar).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECCION 4: FLUJO DE CAJA (DESGLOSE DE PAGO FINAL) */}
                    <div>
                      <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 uppercase">
                        04. Flujo de Caja (Egresos)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 border-2 border-black divide-x-2 divide-black text-center">
                        <div className="p-3">
                          <label className="text-[9px] font-black block text-gray-400 uppercase">
                            Efectivo
                          </label>
                          <p className="font-mono font-bold">
                            ${parseFloat(selectedLiq.pagoEfectivo).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3">
                          <label className="text-[9px] font-black block text-gray-400 uppercase">
                            Cheques
                          </label>
                          <p className="font-mono font-bold">
                            ${parseFloat(selectedLiq.pagoCheque).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3">
                          <label className="text-[9px] font-black block text-gray-400 uppercase">
                            Transf.
                          </label>
                          <p className="font-mono font-bold">
                            ${parseFloat(selectedLiq.pagoTransferencia).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50">
                          <label className="text-[9px] font-black block text-blue-600 uppercase italic">
                            Pago Deuda Ant.
                          </label>
                          <p className="font-mono font-black text-blue-700">
                            $
                            {parseFloat(
                              selectedLiq.CuentasPorPagars?.[0]?.AbonosCuentasPorPagars?.[0]
                                ?.monto || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div
                          className={`p-3 ${parseFloat(selectedLiq.montoPorPagar) > 0.01 ? 'bg-yellow-400' : 'bg-emerald-500 text-white'}`}
                        >
                          <label className="text-[9px] font-black block uppercase italic">
                            Saldo Pendiente
                          </label>
                          <p className="font-mono font-black text-lg">
                            ${parseFloat(selectedLiq.montoPorPagar).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {selectedLiq.CuentasPorPagars?.[0]?.AbonosCuentasPorPagars?.[0] && (
                        <p className="text-[9px] font-bold mt-2 text-blue-600 italic lowercase">
                          * Nota: El pago de deuda anterior corresponde al registro ID #
                          {selectedLiq.CuentasPorPagars[0].AbonosCuentasPorPagars[0].id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="bg-gray-50 p-6 border-t-2 border-black flex justify-between items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase italic">
                      Aroma de Oro ERP - Registro de Auditoría Interna
                    </p>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-black text-white px-10 py-3 font-black uppercase hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      Cerrar Expediente
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* BUSCADOR DE PRODUCTOR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 uppercase font-black">
              <div className="md:col-span-2 relative">
                <div className="flex border-2 border-gray-800 group">
                  <input
                    disabled={isFormDisabled}
                    type="text"
                    className="w-full p-3 font-bold outline-none group-focus-within:bg-gray-50"
                    value={cedulaBusqueda}
                    onChange={(e) => {
                      setCedulaBusqueda(e.target.value)
                      setMostrarSugerencias(true)
                    }}
                    onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                    onFocus={() => setMostrarSugerencias(true)}
                    placeholder="ESCRIBA NOMBRE, CÉDULA O RUC..."
                  />
                  <button
                    onClick={buscarProductor}
                    className="px-8 bg-gray-800 text-white hover:bg-black transition-colors"
                  >
                    <MdSearch size={24} />
                  </button>
                </div>
                {mostrarSugerencias && productoresFiltrados.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border-2 border-black mt-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                    {productoresFiltrados.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => p.estaActivo !== false && seleccionarProductor(p)}
                        className="p-3 border-b border-gray-100 flex justify-between items-center hover:bg-emerald-50 cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-black">{p.nombreCompleto}</span>
                          <span className="text-[10px] text-gray-500">
                            {p.numeroIdentificacion}
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-500 text-white px-2 py-1 border border-black font-black italic">
                          SELECCIONAR
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div
                  className={`border-2 p-3 flex items-center justify-between transition-all ${productorInfo ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'bg-gray-50 opacity-50 border-gray-300'}`}
                >
                  <span className={productorInfo ? 'text-sm font-black' : 'text-[10px]'}>
                    {productorInfo?.nombreCompleto || 'Esperando identificación...'}
                  </span>
                  {productorInfo && <MdReceipt className="text-emerald-600" size={20} />}
                </div>
                {/* ALERTA DE DEUDA ARRASTRADA */}
                {productorInfo && deudaAnterior > 0 && (
                  <div className="bg-amber-400 border-2 border-black p-1 px-3 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[9px] font-black tracking-tighter">
                      DEUDA ANTERIOR DETECTADA
                    </span>
                    <span className="text-xs font-mono font-black">
                      ${deudaAnterior.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* FORMULARIO NUEVO PRODUCTOR */}
            {mostrarFormProductor && (
              <div className="mb-8 border-4 border-gray-800 bg-white p-6  animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center border-b-2 border-gray-800 pb-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-800 font-black uppercase  text-lg">
                    <MdPersonAdd size={24} className="text-emerald-600" />
                    <span>Registrar Datos del Productor</span>
                  </div>
                  <button
                    onClick={() => setMostrarFormProductor(false)}
                    className="hover:rotate-90 transition-transform p-1"
                  >
                    <MdClose size={28} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 font-black uppercase ">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 ml-1 flex items-center gap-1">
                      <MdPersonAdd size={12} /> Nombre Completo *
                    </label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-800 p-3 text-sm outline-none focus:bg-emerald-50"
                      value={nuevoProductor.nombreCompleto}
                      onChange={(e) =>
                        setNuevoProductor({
                          ...nuevoProductor,
                          nombreCompleto: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="NOMBRE / RAZÓN SOCIAL"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 ml-1 flex items-center gap-1">
                      <MdPhone size={12} /> Teléfono (Opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-800 p-3 text-sm outline-none focus:bg-emerald-50"
                      value={nuevoProductor.telefono}
                      onChange={(e) =>
                        setNuevoProductor({ ...nuevoProductor, telefono: e.target.value })
                      }
                      placeholder="09XXXXXXXX"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 ml-1 flex items-center gap-1">
                      <MdEmail size={12} /> Email (Opcional)
                    </label>
                    <input
                      type="email"
                      className="w-full border-2 border-gray-800 p-3 text-sm outline-none focus:bg-emerald-50"
                      value={nuevoProductor.email || ''}
                      onChange={(e) =>
                        setNuevoProductor({
                          ...nuevoProductor,
                          email: e.target.value.toLowerCase(),
                        })
                      }
                      placeholder="CORREO@EJEMPLO.COM"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 ml-1 flex items-center gap-1">
                      <MdLocationOn size={12} /> Dirección (Opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-800 p-3 text-sm outline-none focus:bg-emerald-50"
                      value={nuevoProductor.direccion || ''}
                      onChange={(e) =>
                        setNuevoProductor({
                          ...nuevoProductor,
                          direccion: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="UBICACIÓN / SECTOR"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={ejecutarRegistro}
                    className="bg-emerald-600 text-white px-10 py-3 font-black uppercase  border-2 border-gray-800  hover:bg-emerald-700 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Confirmar y Registrar
                  </button>
                </div>
              </div>
            )}

            {/* TABLA TÉCNICA */}
            <div className="overflow-x-auto mb-8 border-2 border-gray-800 ">
              <table className="w-full min-w-[1200px] border-collapse font-black uppercase text-sm ">
                <thead className="bg-gray-800 text-white text-[10px] tracking-widest">
                  <tr>
                    <th className="p-3 text-left w-[220px]">Producto</th>
                    <th className="p-3 w-[120px] bg-gray-700 text-center">Cant. Bruta</th>
                    <th className="p-3 w-[130px] bg-gray-600 text-center">Unidad Rec.</th>
                    <th className="p-3 w-[130px] bg-gray-600 text-center">Unidad Pago</th>

                    <th className="p-3 w-[100px] bg-blue-900 text-blue-100 ">Calif % (H)</th>
                    <th className="p-3 w-[100px] bg-blue-900 text-blue-100 ">Imp %</th>
                    <th className="p-3 w-[120px] bg-emerald-700 text-emerald-100 font-black">
                      Cant. Neta
                    </th>
                    <th className="p-3 w-[120px]">Precio</th>
                    <th className="p-4 text-right w-[180px] bg-gray-900">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b-2 border-gray-100">
                    <td className="p-2 border-r border-gray-800 w-[220px]">
                      <select
                        value={productoSeleccionado} // Suponiendo que aquí guardas el ID
                        onChange={(e) => {
                          const idSeleccionado = e.target.value
                          setProductoSeleccionado(idSeleccionado) // Guardas el ID

                          // BUSCAMOS EL OBJETO COMPLETO EN TU LISTA DE PRODUCTOS
                          const productoReal = productos.find(
                            (p) => String(p.id) === String(idSeleccionado)
                          )

                          if (productoReal) {
                            // Ahora sí puedes acceder a las propiedades del objeto
                            setUnidadProductoSeleccionado(productoReal.unidadMedida)
                            setNombreProductoSeleccionado(productoReal.nombre)

                            // // TIP EXTRA: Si el producto es Cacao y se paga en Quintales,
                            // // puedes setear la unidad de pago de una vez:
                            // setUnidadPago(productoReal.unidadMedida || 'Quintales')
                          }
                        }}
                        className="w-full p-2 outline-none text-xs font-black bg-transparent"
                      >
                        <option value="">-- SELECCIONAR PRODUCTO --</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border-r border-gray-800 bg-gray-50 text-center">
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        className="w-full text-center font-mono text-xl outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-2 border-r border-gray-800 bg-gray-100">
                      <select
                        value={unidad}
                        onChange={(e) => setUnidad(e.target.value)}
                        className="w-full p-2 outline-none text-xs font-black text-center bg-transparent"
                      >
                        <option value="Quintales">Quintales</option>
                        <option value="Kilogramos">Kilogramos</option>
                        <option value="Libras">Libras</option>
                        <option value="Tacho">Tacho</option>
                      </select>
                    </td>
                    <td className="p-2 border-r border-gray-800 bg-gray-100">
                      <select
                        value={unidadPago}
                        onChange={(e) => setUnidadPago(e.target.value)}
                        className="w-full p-2 outline-none text-xs font-black text-center bg-transparent"
                      >
                        <option value="Quintales">Quintales</option>
                        <option value="Kilogramos">Kilogramos</option>
                        <option value="Libras">Libras</option>
                        <option value="Tacho">Tacho</option>
                      </select>
                    </td>
                    <td className="p-2 border-r border-gray-800 bg-blue-50">
                      <input
                        type="number"
                        value={calificacion}
                        onChange={(e) => setCalificacion(e.target.value)}
                        className="w-full text-center font-mono text-xl outline-none bg-transparent text-blue-800"
                      />
                    </td>
                    <td className="p-2 border-r border-gray-800 bg-blue-50">
                      <input
                        type="number"
                        value={impurezas}
                        onChange={(e) => setImpurezas(e.target.value)}
                        className="w-full text-center font-mono text-xl outline-none bg-transparent text-blue-800"
                      />
                    </td>
                    <td className="p-2 border-r border-gray-800 bg-emerald-50 text-center font-mono text-xl text-emerald-800 font-black">
                      {Number(pesoNeto || 0)}
                    </td>
                    <td className="p-2 border-r border-gray-800 bg-gray-50">
                      <input
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        className="w-full text-center font-mono text-xl outline-none bg-transparent"
                      />
                    </td>
                    <td className="p-4 text-right font-mono text-2xl bg-gray-100 text-gray-900 font-black">
                      ${Number(bruto || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="bg-gray-800 text-white p-2 text-[9px] flex justify-end gap-6 px-6 uppercase font-black">
                <span className="opacity-70">
                  Merma Calidad: -{Number(mermaCalificacion || 0).toFixed(2)}
                </span>
                <span className="opacity-70">
                  Merma Impurezas: -{Number(mermaImpurezas || 0).toFixed(2)}
                </span>
                <span className="text-amber-400">
                  Total Merma: -{Number(totalMerma || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* SECCIÓN ANTICIPOS */}
            {anticiposPendientes && anticiposPendientes.length > 0 && (
              <div className="mb-8 border-2 border-gray-800 bg-gray-50 overflow-hidden font-black uppercase ">
                <div className="bg-gray-800 p-2 flex items-center gap-2 text-white">
                  <MdAccountBalanceWallet size={18} className="text-emerald-400" />
                  <span className="text-[10px] tracking-widest">Cruce de Anticipos Pendientes</span>
                </div>
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1 underline font-black">
                      Deuda Total del Productor
                    </span>
                    <span className="text-xl font-mono text-red-600 bg-white px-3 py-1 border-2 border-gray-300">
                      ${' '}
                      {anticiposPendientes
                        .reduce((acc, a) => acc + (parseFloat(a.saldoPendiente) || 0), 0)
                        .toFixed(2)}
                    </span>{' '}
                  </div>
                  <div className="flex items-center gap-4 bg-white border-2 border-gray-800 p-3">
                    <label className="text-[10px]">Cruce a Aplicar Hoy:</label>
                    <div className="relative border-b-2 border-gray-800">
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                        $
                      </span>
                      <input
                        type="number"
                        value={montoAplicarAnticipo}
                        onChange={(e) => setMontoAplicarAnticipo(e.target.value)}
                        className="w-32 pl-4 text-right font-mono font-black text-lg outline-none text-emerald-700 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGOS Y TOTALES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 font-black uppercase ">
              <div className="space-y-4">
                {/* METODOS DE PAGO */}
                <div className="border-2 border-gray-800 p-5 bg-white relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  <p className="text-[11px] border-b-2 border-gray-800 pb-2 mb-4 flex items-center gap-2 font-black">
                    <MdPayments size={18} /> Detalle de Pagos
                  </p>
                  <div className="grid grid-cols-3 gap-3 font-mono">
                    {['efectivo', 'cheque', 'transferencia'].map((m) => (
                      <div key={m} className="space-y-1 text-center">
                        <label className="text-[9px] text-gray-400 block capitalize">{m}</label>
                        <input
                          type="number"
                          value={pagos[m]}
                          onChange={(e) => setPagos({ ...pagos, [m]: e.target.value })}
                          className="w-full border-2 border-gray-800 p-2 text-center text-lg outline-none focus:bg-emerald-50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* RETENCIONES */}
                <div className="border-2 border-gray-800 p-5 bg-white relative">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                  <p className="text-[11px] border-b-2 border-gray-800 pb-2 mb-4 flex items-center gap-2 font-black">
                    <MdMoneyOff size={18} /> Retención Legal
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={retencionConcepto}
                      onChange={(e) => setRetencionConcepto(e.target.value.toUpperCase())}
                      className="w-full border-2 border-gray-200 p-2 text-[10px] outline-none font-black"
                      placeholder="CONCEPTO"
                    />
                    <div className="flex gap-4 items-end font-mono">
                      <div className="w-1/3">
                        <label className="text-[9px] text-gray-400 block mb-1">
                          Porcentaje (%)
                        </label>
                        <input
                          type="number"
                          value={retencionPorcentaje}
                          onChange={(e) => setRetencionPorcentaje(e.target.value)}
                          className="w-full border-2 border-gray-800 p-2 text-xl outline-none"
                        />
                      </div>
                      <div className="flex-1 bg-gray-50 p-2 border border-dashed border-gray-400 text-right">
                        <span className="text-[10px] text-gray-400 block mb-1 font-black">
                          Valor Retenido:
                        </span>
                        <span className="text-2xl font-black text-red-600">
                          -${Number(valorRetenido || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOTALES FINALES */}
              <div className="border-[4px] border-gray-900 p-6 bg-gray-50 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-gray-300 pb-2 font-black">
                    <span className="text-gray-500">Subtotal Liquidación:</span>
                    <span className="font-mono text-lg">${Number(bruto || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-300 pb-2 text-red-600 font-black">
                    <span>(-) Retenciones:</span>
                    <span className="font-mono">-${Number(valorRetenido || 0).toFixed(2)}</span>
                  </div>
                  {/* LÍNEA DE DEUDA ANTERIOR EN RESUMEN */}
                  {deudaAnterior > 0 && (
                    <div className="flex justify-between items-center text-sm border-b border-gray-300 pb-2 text-amber-600 font-black">
                      <span>(+) Deuda Anterior:</span>
                      <span className="font-mono">${deudaAnterior.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-black border-b-2 border-gray-900 pb-2 mb-4 tracking-tighter">
                    <span>Total a Pagar:</span>
                    <span className="text-3xl font-mono text-emerald-700">
                      ${Number(totalAPagar || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white border-2 border-gray-800 p-2 text-center">
                      <p className="text-[8px] text-emerald-600 font-black">(-) Cruce Anticipo</p>
                      <p className="text-xl font-mono font-black">
                        -${Number(montoAplicarAnticipo || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white border-2 border-gray-800 p-2 text-center">
                      <p className="text-[8px] text-gray-400 font-black">(-) Abono Hoy</p>
                      <p className="text-xl font-mono font-black">
                        -${Number(montoAbonadoTotal || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-800 text-white p-4 text-center border-b-8 border-amber-500">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-[0.2em] font-black">
                      Saldo Pendiente (CRÉDITO)
                    </p>
                    <p className="text-5xl font-mono font-black text-amber-400 ">
                      ${Number(saldoADeber || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  disabled={loading || isFormDisabled}
                  onClick={handleGuardar}
                  className={`w-full mt-8 py-5 flex items-center justify-center gap-3 transition-all transform border-b-[6px] active:border-b-0 active:translate-y-2 ${loading || isFormDisabled ? 'bg-gray-200 text-gray-400 border-gray-300' : 'bg-gray-900 text-white border-gray-700 hover:bg-black font-black'}`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <MdReceipt size={30} className="text-amber-400" />
                  )}
                  <span className="text-xl uppercase tracking-tighter">
                    {loading ? 'Procesando...' : 'Finalizar Transacción'}
                  </span>
                </button>
              </div>
            </div>

            {/* HISTORIAL */}
            <div className="mt-12 pt-8 border-t-[4px] border-gray-800">
              <div className="flex items-center gap-2 mb-6 font-black uppercase tracking-tighter">
                <div className="w-2 h-8 bg-emerald-500"></div>
                <h3 className="text-xl underline decoration-gray-800 underline-offset-8 font-black">
                  Historial de Movimientos
                </h3>
              </div>
              <ComprasHeader
                filtros={filtros}
                setFiltros={setFiltros}
                productores={productores}
                resetFiltros={resetFiltros}
              />
              <ComprasTable
                liquidaciones={liquidacionesFiltradas}
                setSelectedLiq={setSelectedLiq}
                setShowModal={setShowModal}
              />
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export default Compras
