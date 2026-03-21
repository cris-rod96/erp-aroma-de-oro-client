import {
  MdBusiness,
  MdSearch,
  MdPersonAdd,
  MdPayments,
  MdMoneyOff,
  MdLock,
  MdClose,
} from 'react-icons/md'
import { ComprasHeader, ComprasTable, Container } from '../../components/index.components'
import { useLiquidacion } from '../../hooks/useCompras'

const Compras = () => {
  const {
    // Estados y Datos
    liquidaciones,
    productos,
    loading,
    empresa,
    caja,
    selectedLiq,
    setSelectedLiq,
    showModal,
    setShowModal,
    cedulaBusqueda,
    setCedulaBusqueda,
    productorInfo,
    mostrarFormProductor,
    nuevoProductor,
    setNuevoProductor,
    productoSeleccionado,
    setProductoSeleccionado,
    calificacion,
    setCalificacion,
    unidad,
    setUnidad,
    cantidad,
    setCantidad,
    precio,
    setPrecio,
    prima,
    setPrima,
    ivaPorcentaje,
    setIvaPorcentaje,
    humedad,
    setHumedad,
    impurezas,
    setImpurezas,
    retencionConcepto,
    setRetencionConcepto,
    retencionPorcentaje,
    setRetencionPorcentaje,
    descuento,
    setDescuento,
    pagos,
    setPagos,

    // Valores Calculados (Derivados)
    pesoBruto,
    pesoNeto,
    totalMerma,
    mermaHumedad,
    mermaImpurezas,
    bruto,
    parcial,
    valorIVA,
    valorRetenido,
    totalAPagar,
    montoAbonado,
    saldoADeber,
    isFormDisabled,

    // Funciones de Acción
    buscarProductor,
    handleRegistrarProductor,
    handleGuardar,
  } = useLiquidacion()

  return (
    <Container fullWidth={true}>
      <div className="w-full px-2 md:px-6 py-4 text-gray-800 bg-white font-sans relative">
        {/* MODAL DE DETALLE COMPLETO */}
        {showModal && selectedLiq && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
            <div className="bg-white border-[3px] border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
              {/* HEADER MODAL */}
              <div className="bg-black text-white p-4 flex justify-between items-center sticky top-0">
                <div className="flex flex-col">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase">
                    Expediente de Liquidación
                  </h2>
                  <span className="text-[10px] text-amber-400 font-bold">{selectedLiq.id}</span>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="hover:rotate-90 transition-transform duration-300"
                >
                  <MdClose size={32} />
                </button>
              </div>

              <div className="p-8 space-y-8 uppercase font-sans">
                {/* SECCION 1: DATOS GENERALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-2 border-gray-100 pb-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 block mb-1">
                      CÓDIGO INTERNO
                    </label>
                    <p className="text-lg font-black">{selectedLiq.codigo}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 block mb-1">
                      FECHA DE REGISTRO
                    </label>
                    <p className="font-bold">{new Date(selectedLiq.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <label className="text-[10px] font-black text-gray-400 block mb-1">
                      ESTADO DE PAGO
                    </label>
                    <span
                      className={`text-xs font-black px-4 py-1 border-2 ${parseFloat(selectedLiq.montoPorPagar) > 0 ? 'border-orange-500 text-orange-600' : 'border-emerald-500 text-emerald-600'}`}
                    >
                      {parseFloat(selectedLiq.montoPorPagar) > 0
                        ? 'SALDO PENDIENTE'
                        : 'CANCELADO TOTAL'}
                    </span>
                  </div>
                </div>

                {/* SECCION 2: TABLA TÉCNICA DE PRODUCTO (CÁLCULOS DE MERMA) */}
                <div>
                  <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 italic">
                    01. Análisis de Calidad y Peso
                  </h3>
                  <table className="w-full border-2 border-black">
                    <thead className="bg-gray-100 border-b-2 border-black text-[10px] font-black">
                      <tr>
                        <th className="p-2 text-left border-r border-black">PRODUCTO</th>
                        <th className="p-2 text-center border-r border-black">CALIFICACIÓN</th>
                        <th className="p-2 text-center border-r border-black">PESO BRUTO</th>
                        <th className="p-2 text-center border-r border-black text-blue-700">
                          HUMEDAD (%)
                        </th>
                        <th className="p-2 text-center border-r border-black text-blue-700">
                          IMPUREZA (%)
                        </th>
                        <th className="p-2 text-right text-red-600">DESC. MERMA</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-bold">
                      <tr>
                        <td className="p-3 border-r border-black">
                          {selectedLiq.DetalleLiquidacion?.descripcionProducto}
                        </td>
                        <td className="p-3 border-r border-black text-center">
                          {selectedLiq.DetalleLiquidacion?.calificacion || '---'}
                        </td>
                        <td className="p-3 border-r border-black text-center font-mono">
                          {selectedLiq.DetalleLiquidacion?.cantidad}{' '}
                          {selectedLiq.DetalleLiquidacion?.unidad}
                        </td>
                        <td className="p-3 border-r border-black text-center font-mono">
                          {selectedLiq.DetalleLiquidacion?.humedad}%
                        </td>
                        <td className="p-3 border-r border-black text-center font-mono">
                          {selectedLiq.DetalleLiquidacion?.impurezas}%
                        </td>
                        <td className="p-3 text-right text-red-600 font-mono">
                          -{parseFloat(selectedLiq.DetalleLiquidacion?.descuentoMerma).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50 border-t-2 border-black">
                        <td
                          colSpan="5"
                          className="p-2 text-right font-black text-xs border-r border-black"
                        >
                          PESO NETO A LIQUIDAR:
                        </td>
                        <td className="p-2 text-right font-black text-emerald-700 font-mono">
                          {parseFloat(selectedLiq.DetalleLiquidacion?.cantidadNeta).toFixed(2)}{' '}
                          {selectedLiq.DetalleLiquidacion?.unidad}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SECCION 3: DESGLOSE FINANCIERO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 italic">
                      02. Información del Productor
                    </h3>
                    <div className="border-2 border-black p-4 space-y-2">
                      <p className="font-black text-lg">{selectedLiq.Persona?.nombreCompleto}</p>
                      <p className="text-xs font-bold text-gray-500 italic">
                        Identificación: {selectedLiq.Persona?.numeroIdentificacion}
                      </p>
                      <p className="text-xs font-bold text-gray-500 italic">
                        Contacto: {selectedLiq.Persona?.telefono || 'N/A'}
                      </p>
                      <p className="text-xs font-bold text-gray-500 italic">
                        Dirección: {selectedLiq.Persona?.direccion || 'S/D'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 italic">
                      03. Resumen de Valores
                    </h3>
                    <div className="border-2 border-black">
                      <div className="flex justify-between p-2 border-b border-gray-200 text-xs font-bold">
                        <span>Subtotal:</span>{' '}
                        <span className="font-mono">
                          ${parseFloat(selectedLiq.totalLiquidacion).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 border-b border-gray-200 text-xs font-bold text-red-600">
                        <span>(-) Retención Fuente:</span>{' '}
                        <span className="font-mono">
                          -${parseFloat(selectedLiq.totalRetencion).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 border-b border-gray-200 text-xs font-bold text-emerald-600">
                        <span>(+) Prima/Bonificación:</span>{' '}
                        <span className="font-mono">
                          ${parseFloat(selectedLiq.DetalleLiquidacion?.prima || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-100 font-black text-lg">
                        <span>TOTAL NETO:</span>
                        <span className="font-mono">
                          ${parseFloat(selectedLiq.totalAPagar).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCION 4: HISTORIAL DE PAGOS */}
                <div>
                  <h3 className="text-xs font-black bg-gray-800 text-white px-3 py-1 inline-block mb-3 italic">
                    04. Flujo de Caja
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-black divide-x-2 divide-black">
                    <div className="p-3 text-center">
                      <label className="text-[9px] font-black block text-gray-400">EFECTIVO</label>
                      <p className="font-mono font-bold">
                        ${parseFloat(selectedLiq.pagoEfectivo).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 text-center">
                      <label className="text-[9px] font-black block text-gray-400">CHEQUES</label>
                      <p className="font-mono font-bold">
                        ${parseFloat(selectedLiq.pagoCheque).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 text-center">
                      <label className="text-[9px] font-black block text-gray-400">
                        TRANSFERENCIA
                      </label>
                      <p className="font-mono font-bold">
                        ${parseFloat(selectedLiq.pagoTransferencia).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 text-center bg-yellow-400">
                      <label className="text-[9px] font-black block text-black">
                        SALDO PENDIENTE
                      </label>
                      <p className="font-mono font-black">
                        ${parseFloat(selectedLiq.montoPorPagar).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 border-t-2 border-black flex justify-between items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Aroma de Oro ERP - Registro de Auditoría Interna
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-black text-white px-10 py-3 font-black uppercase hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CABECERA */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-800 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-4">
            <MdBusiness size={45} />
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                {empresa?.nombre || 'SIN NOMBRE'}
              </h1>
              <p className="text-[10px] font-bold text-gray-600 uppercase">
                {empresa?.ruc || 'SIN RUC'} | {empresa?.direccion || 'SIN DIRECCIÓN'}
              </p>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-800 p-2 text-center w-full md:w-auto">
            <h2 className="text-sm md:text-lg font-black uppercase px-4">
              Liquidación de Compra Directa
            </h2>
            <p className="text-[10px] font-black text-emerald-600">
              {caja ? `CAJA ACTIVA: ${caja.id.slice(0, 8)}` : 'REQUIERE ABIR CAJA'}
            </p>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 uppercase">
          <div className="md:col-span-2">
            <label
              className={`text-[10px] font-black mb-1 block ${isFormDisabled ? 'text-red-600' : 'text-gray-800'}`}
            >
              Identificación del Productor
            </label>
            <div
              className={`flex border-2 ${isFormDisabled ? 'border-gray-200 bg-gray-50' : 'border-gray-800 bg-white'}`}
            >
              <input
                disabled={isFormDisabled}
                type="text"
                className="w-full p-3 font-bold outline-none bg-transparent"
                value={cedulaBusqueda}
                onChange={(e) => {
                  setCedulaBusqueda(e.target.value)
                  if (productorInfo) setProductorInfo(null)
                }}
                onKeyPress={(e) => e.key === 'Enter' && !isFormDisabled && buscarProductor()}
                placeholder="CÉDULA O RUC..."
              />
              <button
                disabled={isFormDisabled}
                onClick={buscarProductor}
                className={`px-6 transition-all ${isFormDisabled ? 'bg-gray-200 text-gray-400' : 'bg-gray-800 text-white hover:bg-black'}`}
              >
                <MdSearch size={22} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-500 mb-1 block">
              Beneficiario / Productor
            </label>
            <div
              className={`border-2 p-3 font-black text-sm min-h-[56px] flex items-center ${productorInfo ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-300 bg-gray-50 text-gray-700'}`}
            >
              {productorInfo?.nombreCompleto || (
                <span className="text-[10px] italic font-normal opacity-60">
                  Esperando identificación...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* REGISTRO RÁPIDO */}
        {mostrarFormProductor && (
          <div className="mb-6 p-6 border-2 border-amber-500 bg-amber-50 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-4 flex items-center gap-2 text-amber-800 font-black text-xs uppercase border-b border-amber-200 pb-2">
              <MdPersonAdd size={20} /> Nuevo Productor
            </div>
            <input
              className="p-3 border-2 border-amber-200 rounded-xl text-xs font-bold uppercase outline-none"
              placeholder="Nombre"
              value={nuevoProductor.nombreCompleto}
              onChange={(e) =>
                setNuevoProductor({
                  ...nuevoProductor,
                  nombreCompleto: e.target.value.toUpperCase(),
                })
              }
            />
            <input
              className="p-3 border-2 border-amber-200 rounded-xl text-xs font-bold outline-none"
              placeholder="Teléfono"
              value={nuevoProductor.telefono}
              onChange={(e) => setNuevoProductor({ ...nuevoProductor, telefono: e.target.value })}
            />
            <button
              onClick={handleRegistrarProductor}
              className="bg-amber-500 text-white font-black text-xs py-3 rounded-xl uppercase hover:bg-amber-600 self-end"
            >
              Guardar
            </button>
          </div>
        )}

        {/* TABLA INGRESO */}
        {/* TABLA INGRESO */}
        <div className="overflow-x-auto mb-8 border-2 border-gray-800 shadow-sm">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead className="bg-gray-800 text-white text-[10px] font-black uppercase">
              <tr>
                <th className="p-2 text-left w-44">Producto</th> {/* Ancho reducido aquí */}
                <th className="p-2 w-20">Calif.</th>
                <th className="p-2 w-32 text-center">Unidad</th>
                <th className="p-2 w-28 text-center bg-gray-700">Cant. Bruta</th>
                <th className="p-2 w-20 text-center bg-blue-900">Hum %</th>
                <th className="p-2 w-20 text-center bg-blue-900">Imp %</th>
                <th className="p-2 w-28 text-center bg-emerald-700">Cant. Neta</th>
                <th className="p-2 w-28 text-center">Precio U.</th>
                {/* COLUMNA PRIMA AÑADIDA */}
                <th className="p-2 w-24 text-center bg-amber-600">Prima</th>
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
                    className="w-full p-2 outline-none text-xs font-black"
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
                    <option value="Libras">Libras (LB)</option>
                    <option value="Unidades">Unidades (UD)</option>
                  </select>
                </td>
                <td className="p-2 border-r border-gray-800 bg-yellow-50">
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2 bg-transparent"
                  />
                </td>
                <td className="p-2 border-r border-gray-800 bg-blue-50">
                  <input
                    type="number"
                    value={humedad}
                    onChange={(e) => setHumedad(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2 bg-transparent text-blue-800"
                  />
                </td>
                <td className="p-2 border-r border-gray-800 bg-blue-50">
                  <input
                    type="number"
                    value={impurezas}
                    onChange={(e) => setImpurezas(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2 bg-transparent text-blue-800"
                  />
                </td>
                <td className="p-2 border-r border-gray-800 bg-emerald-50 text-center font-mono text-xl text-emerald-800">
                  {pesoNeto.toFixed(2)}
                </td>
                <td className="p-2 border-r border-gray-800 bg-gray-50">
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2 bg-transparent"
                  />
                </td>
                {/* INPUT DE PRIMA */}
                <td className="p-2 border-r border-gray-800 bg-amber-50">
                  <input
                    type="number"
                    value={prima}
                    onChange={(e) => setPrima(e.target.value)}
                    className="w-full text-center font-mono text-xl outline-none p-2 bg-transparent text-amber-800"
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
                  ${bruto.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="bg-gray-800 text-white p-2 text-[9px] flex justify-end gap-4 italic px-4">
            <span>MERMA HUMEDAD: -{mermaHumedad.toFixed(2)}</span>
            <span>MERMA IMPUREZAS: -{mermaImpurezas.toFixed(2)}</span>
            <span className="font-black text-yellow-400">
              DESCUENTO TOTAL: -{totalMerma.toFixed(2)} {unidad.toUpperCase()}
            </span>
          </div>
        </div>

        {/* PAGOS Y RETENCIONES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 uppercase">
          <div className="border-2 border-gray-800 p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
            <p className="text-[11px] font-black border-b-2 border-gray-800 pb-2 flex items-center gap-2">
              <MdMoneyOff size={18} className="text-red-600" /> Retención en la Fuente
            </p>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={retencionConcepto}
                onChange={(e) => setRetencionConcepto(e.target.value.toUpperCase())}
                className="w-full border-2 border-gray-800 p-2.5 text-xs font-bold outline-none"
                placeholder="CONCEPTO..."
              />
              <div className="flex items-end justify-between gap-4">
                <div className="w-1/3">
                  <label className="text-[10px] font-black text-gray-500">%</label>
                  <input
                    type="number"
                    value={retencionPorcentaje}
                    onChange={(e) => setRetencionPorcentaje(e.target.value)}
                    className="w-full border-2 border-gray-800 p-2 font-mono font-black text-xl outline-none"
                  />
                </div>
                <div className="flex-1 text-right bg-gray-50 p-2 border border-dashed border-gray-300">
                  <span className="text-[10px] font-black text-gray-500 block">Descontar:</span>
                  <span className="text-2xl font-mono font-black text-red-600">
                    -${valorRetenido.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-4 border-gray-800 p-5 bg-gray-50 shadow-md">
            <div className="flex justify-between font-black text-3xl border-b-4 border-gray-800 mb-6 pb-2 italic">
              <span>Total:</span>
              <span>${totalAPagar.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {['Descuento', 'Efectivo', 'Cheque', 'Transf.'].map((l, i) => (
                <div
                  key={l}
                  className={`border-2 p-2 bg-white ${i === 0 ? 'border-red-600' : 'border-gray-800'}`}
                >
                  <label className={`text-[9px] font-black block ${i === 0 ? 'text-red-600' : ''}`}>
                    {l}
                  </label>
                  <input
                    type="number"
                    className="w-full font-mono font-black text-lg outline-none"
                    value={i === 0 ? descuento : Object.values(pagos)[i - 1]}
                    onChange={(e) =>
                      i === 0
                        ? setDescuento(e.target.value)
                        : setPagos({ ...pagos, [Object.keys(pagos)[i - 1]]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white border-2 border-gray-800 p-3 text-center">
                <p className="text-[9px] font-black text-gray-400">Pagado</p>
                <p className="text-2xl font-mono font-black">${montoAbonado.toFixed(2)}</p>
              </div>
              <div className="bg-gray-800 text-white p-3 text-center">
                <p className="text-[9px] font-black text-gray-400">Saldo</p>
                <p className="text-2xl font-mono font-black text-yellow-400">
                  ${saldoADeber.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              disabled={loading || isFormDisabled}
              onClick={handleGuardar}
              className={`w-full py-5 flex items-center justify-center gap-3 transition-all transform font-black border-b-4 active:border-b-0 active:translate-y-1 ${loading || isFormDisabled ? 'bg-gray-200 text-gray-400 grayscale' : 'bg-amber-500 text-black border-amber-700 hover:bg-amber-400 shadow-lg'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin" />
              ) : isFormDisabled ? (
                <MdLock size={20} />
              ) : (
                <MdPayments size={22} />
              )}
              <span>
                {loading ? 'Procesando...' : isFormDisabled ? 'Bloqueado' : 'Finalizar Liquidación'}
              </span>
            </button>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="mt-12 border-t-4 border-gray-800 pt-8 uppercase">
          <ComprasHeader />
          <ComprasTable
            liquidaciones={liquidaciones}
            setSelectedLiq={setSelectedLiq}
            setShowModal={setShowModal}
          />
        </div>
      </div>
    </Container>
  )
}

export default Compras
