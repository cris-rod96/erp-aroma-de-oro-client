import { useState, useEffect, useMemo } from 'react'
import {
  MdReceipt,
  MdPrint,
  MdDelete,
  MdBusiness,
  MdPersonAdd,
  MdClose,
  MdSearch,
  MdErrorOutline,
  MdLock,
} from 'react-icons/md'
import { FaBoxesStacked } from 'react-icons/fa6'
import Swal from 'sweetalert2'
import { Container } from '../../components/index.components'
import { compradorAPI, empresaAPI, productoAPI, ventaAPI } from '../../api/index.api'
import { useAuthStore } from '../../store/useAuthStore'
import { useCajaStore } from '../../store/useCajaStore'
import { useEmpresaStore } from '../../store/useEmpresaStore'

const Ventas = () => {
  const token = useAuthStore((store) => store.token)
  const usuarioLogueado = useAuthStore((store) => store.user)
  const caja = useCajaStore((store) => store.caja)
  const empresa = useEmpresaStore((store) => store.empresa)
  const setEmpresa = useEmpresaStore((store) => store.setEmpresa)

  const isFormDisabled = !empresa?.id || !caja || caja.estado !== 'Abierta'

  // --- ESTADOS DE DATOS ---
  const [compradores, setCompradores] = useState([])
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroHistorial, setFiltroHistorial] = useState('')

  // --- ESTADOS DEL FORMULARIO ---
  const [cedulaBusqueda, setCedulaBusqueda] = useState('')
  const [compradorInfo, setCompradorInfo] = useState(null)
  const [mostrarRegistroComprador, setMostrarRegistroComprador] = useState(false)
  const [nuevoComprador, setNuevoComprador] = useState({
    nombreCompleto: '',
    telefono: '',
    direccion: '',
    tipoIdentificacion: 'RUC',
  })

  const [formData, setFormData] = useState({
    ProductoId: '',
    cantidad: '',
    precio: '',
    unidadVenta: 'Quintales',
    ivaPorcentaje: 0, // MANUAL
    descuento: 0,
    conceptoRetencion: '', // MANUAL
    porcentajeRetencion: 0, // MANUAL
    prima: 0,
    esCredito: false,
    abonoManual: '',
  })

  // --- CARGA INICIAL ---
  const fetchInicial = async () => {
    try {
      const [respEmp, respComp, respProd, respVent] = await Promise.all([
        empresaAPI.obtenerInformacion(token),
        compradorAPI.listarTodos(token),
        productoAPI.listarProductos(token),
        ventaAPI.listarVentas(token),
      ])
      setEmpresa(respEmp.data.empresa || null)
      setCompradores(respComp.data.compradores || [])
      setProductos(respProd.data.productos || [])
      setVentas(respVent.data.ventas || [])
      if (respProd.data.productos?.length > 0) {
        setFormData((prev) => ({ ...prev, ProductoId: respProd.data.productos[0].id }))
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  useEffect(() => {
    fetchInicial()
  }, [token])

  // --- LÓGICA DE NEGOCIO ---
  const productoActual = useMemo(
    () => productos.find((p) => p.id === formData.ProductoId),
    [formData.ProductoId, productos]
  )

  const calculos = useMemo(() => {
    const cant = parseFloat(formData.cantidad) || 0
    const prec = parseFloat(formData.precio) || 0
    const desc = parseFloat(formData.descuento) || 0
    const pri = parseFloat(formData.prima) || 0
    const pRet = parseFloat(formData.porcentajeRetencion) || 0
    const pIva = parseFloat(formData.ivaPorcentaje) || 0

    const subtotalBruto = cant * prec
    const baseImponible = subtotalBruto - desc + pri
    const valorIva = baseImponible * (pIva / 100)
    const valorRetencion = baseImponible * (pRet / 100)
    const totalFactura = baseImponible + valorIva - valorRetencion

    const abonado = formData.esCredito ? parseFloat(formData.abonoManual) || 0 : totalFactura
    const saldo = Math.max(0, totalFactura - abonado)

    const cantQQ =
      formData.unidadVenta === 'Kilogramos'
        ? cant / 45.36
        : formData.unidadVenta === 'Libras'
          ? cant / 100
          : cant
    const stockExcedido = productoActual ? cantQQ > parseFloat(productoActual.stock) : false

    return {
      subtotalBruto,
      baseImponible,
      valorIva,
      valorRetencion,
      totalFactura,
      abonado,
      saldo,
      stockExcedido,
    }
  }, [formData, productoActual])

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(
      (v) =>
        v.numeroFactura.toLowerCase().includes(filtroHistorial.toLowerCase()) ||
        v.Persona?.nombreCompleto.toLowerCase().includes(filtroHistorial.toLowerCase())
    )
  }, [ventas, filtroHistorial])

  // --- ACCIONES ---
  const handleBuscarComprador = () => {
    if (isFormDisabled || !cedulaBusqueda) return
    const encontrado = compradores.find((c) => c.numeroIdentificacion === cedulaBusqueda)
    if (encontrado) {
      setCompradorInfo(encontrado)
      setMostrarRegistroComprador(false)
    } else {
      setCompradorInfo({ numeroIdentificacion: cedulaBusqueda, nombreCompleto: 'NO REGISTRADO' })
      setMostrarRegistroComprador(true)
    }
  }

  const handleFinalizarVenta = async () => {
    if (isFormDisabled) return
    if (!compradorInfo?.id) return Swal.fire('Error', 'Seleccione un comprador', 'error')

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar Registro?',
      text: `Total Factura: $${calculos.totalFactura.toFixed(2)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Registro',
      confirmButtonColor: '#111827',
    })

    if (isConfirmed) {
      setLoading(true)
      try {
        const payload = {
          venta: {
            ...formData,
            numeroFactura: `FAC-${Date.now().toString().slice(-6)}`,
            totalFactura: calculos.totalFactura,
            valorIva: calculos.valorIva,
            valorRetencion: calculos.valorRetencion,
            montoAbonado: calculos.abonado,
            montoPendiente: calculos.saldo,
            CompradorId: compradorInfo.id,
            UsuarioId: usuarioLogueado.id,
          },
          CajaId: caja.id,
        }
        await ventaAPI.crearVenta(payload, token)
        Swal.fire('Éxito', 'Venta registrada con éxito', 'success')
        setFormData({
          ...formData,
          cantidad: '',
          precio: '',
          abonoManual: '',
          esCredito: false,
          descuento: 0,
          prima: 0,
          ivaPorcentaje: 0,
          porcentajeRetencion: 0,
          conceptoRetencion: '',
        })
        setCompradorInfo(null)
        setCedulaBusqueda('')
        fetchInicial()
      } catch (error) {
        Swal.fire('Error', 'Fallo al procesar', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Container fullWidth={true}>
      {productos.length > 0 ? (
        <div className="w-full px-6 py-4 text-gray-800 bg-white font-sans">
          {/* CABECERA (DISEÑO ORIGINAL) */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <MdBusiness size={45} className="text-gray-800" />
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                  {empresa?.nombre || 'SIN NOMBRE'}
                </h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                  RUC: {empresa?.ruc || 'SIN RUC'} | Ventas Aroma de Oro
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black uppercase border-b-2 border-gray-800 px-2">
                Factura de Venta
              </h2>
              <p
                className={`font-mono font-bold text-sm mt-1 ${isFormDisabled ? 'text-red-600' : 'text-emerald-600'}`}
              >
                {isFormDisabled ? 'BLOQUEADO' : `CAJA ACTIVA: ${caja?.id.slice(0, 8)}`}
              </p>
            </div>
          </div>

          {/* BUSCADOR COMPRADOR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 py-4 border-b border-gray-200">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase mb-1 block text-gray-400">
                Identificación (RUC/Cédula)
              </label>
              <div className="flex gap-2">
                <input
                  disabled={isFormDisabled}
                  type="text"
                  value={cedulaBusqueda}
                  onChange={(e) => setCedulaBusqueda(e.target.value)}
                  className="flex-1 border-2 border-gray-800 p-2 text-sm font-bold uppercase outline-none focus:bg-gray-50"
                  placeholder="Buscar Comprador..."
                />
                <button
                  disabled={isFormDisabled}
                  onClick={handleBuscarComprador}
                  className="bg-gray-800 text-white px-6 flex items-center gap-2 text-[10px] font-black uppercase hover:bg-black transition-colors"
                >
                  <MdSearch size={16} /> Buscar
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase mb-1 block text-gray-400">
                Razón Social
              </label>
              <div
                className={`border-2 p-2 text-sm font-black uppercase h-[44px] flex items-center justify-between ${mostrarRegistroComprador ? 'bg-red-50 text-red-600 border-red-600' : 'bg-gray-50 border-gray-800'}`}
              >
                {compradorInfo?.nombreCompleto || '---'}
                {mostrarRegistroComprador && <MdPersonAdd size={18} className="animate-pulse" />}
              </div>
            </div>
          </div>

          {/* REGISTRO RÁPIDO */}
          {mostrarRegistroComprador && (
            <div className="mb-6 p-4 border-2 border-gray-800 bg-gray-50 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center mb-3 border-b border-gray-300 pb-2">
                <h4 className="text-[10px] font-black uppercase flex items-center gap-2">
                  <MdPersonAdd size={16} /> Registro de Nuevo Comprador
                </h4>
                <button onClick={() => setMostrarRegistroComprador(false)}>
                  <MdClose size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="NOMBRE / EMPRESA"
                  className="border border-gray-800 p-2 text-xs font-bold uppercase outline-none"
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
                  className="border border-gray-800 p-2 text-xs font-bold outline-none"
                  onChange={(e) =>
                    setNuevoComprador({ ...nuevoComprador, telefono: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="DIRECCIÓN"
                  className="border border-gray-800 p-2 text-xs font-bold uppercase outline-none"
                  onChange={(e) =>
                    setNuevoComprador({
                      ...nuevoComprador,
                      direccion: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <button className="mt-3 bg-gray-900 text-white font-black text-[10px] uppercase p-3 px-10 hover:bg-black">
                Registrar e Importar
              </button>
            </div>
          )}

          {/* TABLA DE PRODUCTO (CON IVA MANUAL) */}
          <div
            className={`mb-8 ${isFormDisabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}
          >
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] font-black uppercase text-gray-400 italic">
                {productoActual
                  ? `Stock Disponible: ${productoActual.stock} ${productoActual.unidadMedida}`
                  : ''}
              </p>
              {calculos.stockExcedido && (
                <span className="text-red-600 text-[10px] font-black flex items-center gap-1 animate-bounce">
                  <MdErrorOutline /> ¡CANTIDAD EXCEDE EL STOCK!
                </span>
              )}
            </div>
            <table className="w-full border-collapse border-2 border-gray-800">
              <thead className="bg-gray-800 text-white text-[9px] font-black uppercase">
                <tr>
                  <th className="p-2 border-r border-gray-600 text-left">Producto</th>
                  <th className="p-2 border-r border-gray-600 text-center w-28">Unidad</th>
                  <th className="p-2 border-r border-gray-600 text-center w-28">Cant.</th>
                  <th className="p-2 border-r border-gray-600 text-center w-28">Precio ($)</th>
                  <th className="p-2 border-r border-gray-600 text-center w-20">IVA %</th>
                  <th className="p-2 text-right w-40">Subtotal ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={`border-b-2 border-gray-800 font-bold ${calculos.stockExcedido ? 'bg-red-50' : ''}`}
                >
                  <td className="p-3 border-r-2 border-gray-800 font-black text-sm uppercase">
                    <select
                      className="bg-transparent outline-none w-full"
                      value={formData.ProductoId}
                      onChange={(e) => setFormData({ ...formData, ProductoId: e.target.value })}
                    >
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 border-r-2 border-gray-800">
                    <select
                      value={formData.unidadVenta}
                      onChange={(e) => setFormData({ ...formData, unidadVenta: e.target.value })}
                      className="w-full bg-transparent outline-none text-center font-bold text-xs"
                    >
                      <option value="Quintales">QQ</option>
                      <option value="Kilogramos">KG</option>
                      <option value="Libras">LBS</option>
                    </select>
                  </td>
                  <td className="p-3 border-r-2 border-gray-800">
                    <input
                      type="number"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full text-center font-mono text-xl outline-none bg-transparent"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="p-3 border-r-2 border-gray-800">
                    <input
                      type="number"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full text-center font-mono text-xl outline-none bg-transparent"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="p-3 border-r-2 border-gray-800">
                    <input
                      type="number"
                      value={formData.ivaPorcentaje}
                      onChange={(e) => setFormData({ ...formData, ivaPorcentaje: e.target.value })}
                      className="w-full text-center font-black text-lg outline-none bg-transparent"
                    />
                  </td>
                  <td className="p-3 text-right font-mono text-xl bg-gray-50">
                    ${calculos.subtotalBruto.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* RETENCIÓN SEPARADA Y AJUSTES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="md:col-span-2 border-2 border-gray-800 p-3 bg-gray-50">
                <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">
                  Concepto de Retención Aplicado
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.conceptoRetencion}
                    onChange={(e) =>
                      setFormData({ ...formData, conceptoRetencion: e.target.value.toUpperCase() })
                    }
                    className="flex-1 bg-transparent font-bold text-xs uppercase outline-none border-b border-gray-300"
                    placeholder="Escriba el concepto..."
                  />
                  <div className="w-20 border-l pl-2">
                    <label className="text-[8px] font-black block">% Ret.</label>
                    <input
                      type="number"
                      value={formData.porcentajeRetencion}
                      onChange={(e) =>
                        setFormData({ ...formData, porcentajeRetencion: e.target.value })
                      }
                      className="w-full bg-transparent font-mono font-black text-red-600 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="border-2 border-gray-800 p-3">
                <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">
                  Descuento (-)
                </label>
                <input
                  type="number"
                  value={formData.descuento}
                  onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                  className="w-full bg-transparent font-mono font-black outline-none"
                />
              </div>
              <div className="border-2 border-gray-800 p-3">
                <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">
                  Prima / Bonus (+)
                </label>
                <input
                  type="number"
                  value={formData.prima}
                  onChange={(e) => setFormData({ ...formData, prima: e.target.value })}
                  className="w-full bg-transparent font-mono font-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* TOTALES DESGLOSADOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div
              className={`border-2 p-4 space-y-4 ${isFormDisabled ? 'border-gray-100 opacity-50' : 'border-gray-800'}`}
            >
              <p className="text-[10px] font-black uppercase border-b border-gray-800 pb-1 text-gray-400">
                Forma de Cobro
              </p>
              <div className="flex gap-2">
                <button
                  disabled={isFormDisabled}
                  onClick={() => setFormData({ ...formData, esCredito: false })}
                  className={`flex-1 p-3 text-[10px] font-black border-2 border-gray-800 transition-all ${!formData.esCredito ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  CONTADO
                </button>
                <button
                  disabled={isFormDisabled}
                  onClick={() => setFormData({ ...formData, esCredito: true })}
                  className={`flex-1 p-3 text-[10px] font-black border-2 border-gray-800 transition-all ${formData.esCredito ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  CRÉDITO
                </button>
              </div>
              {formData.esCredito && (
                <div className="animate-in slide-in-from-top-1">
                  <label className="text-[9px] font-black uppercase mb-1 block text-gray-500">
                    Abono Inicial
                  </label>
                  <input
                    disabled={isFormDisabled}
                    type="number"
                    value={formData.abonoManual}
                    onChange={(e) => setFormData({ ...formData, abonoManual: e.target.value })}
                    className="w-full border-2 border-gray-800 p-2 font-mono font-black text-lg outline-none"
                  />
                </div>
              )}
            </div>

            <div
              className={`border-4 p-4 bg-gray-50 shadow-inner ${isFormDisabled ? 'border-gray-200' : 'border-gray-800'}`}
            >
              <div className="text-[11px] font-black uppercase space-y-2 mb-4 border-b-2 border-gray-300 pb-2">
                <div className="flex justify-between">
                  <span>Base Imponible:</span>
                  <span>$ {calculos.baseImponible.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({formData.ivaPorcentaje}%):</span>
                  <span>+ $ {calculos.valorIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Retención ({formData.porcentajeRetencion}%):</span>
                  <span>- $ {calculos.valorRetencion.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black pt-2 text-gray-900 border-t border-gray-800">
                  <span>TOTAL COBRADO:</span>
                  <span>$ {calculos.totalFactura.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-dashed border-gray-400 text-emerald-600">
                  <span>SALDO COBRADO (CAJA):</span>
                  <span>$ {calculos.abonado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-red-500">
                  <span>SALDO POR COBRAR:</span>
                  <span>$ {calculos.saldo.toFixed(2)}</span>
                </div>
              </div>
              <button
                disabled={loading || isFormDisabled || calculos.stockExcedido}
                onClick={handleFinalizarVenta}
                className={`w-full font-black py-4 uppercase text-xs mt-4 transition-all ${loading || isFormDisabled ? 'bg-gray-300 text-gray-500' : 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]'}`}
              >
                {loading ? 'REGISTRANDO...' : 'Emitir Factura de Venta'}
              </button>
            </div>
          </div>

          {/* HISTORIAL (DISEÑO ORIGINAL) */}
          <div className="mt-10 border-t-2 border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <MdReceipt size={20} />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Historial de Ventas
                </h3>
              </div>
              <div className="relative w-full md:w-64">
                <MdSearch className="absolute left-2 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="BUSCAR FACTURA..."
                  value={filtroHistorial}
                  onChange={(e) => setFiltroHistorial(e.target.value)}
                  className="w-full border-2 border-gray-800 p-2 pl-8 text-[10px] font-bold uppercase outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto border-2 border-gray-800">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-3 border-b-2 border-gray-800 text-left">Factura Nº</th>
                    <th className="p-3 border-b-2 border-gray-800 text-left">Cliente</th>
                    <th className="p-3 border-b-2 border-gray-800 text-right">Total</th>
                    <th className="p-3 border-b-2 border-gray-800 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold uppercase">
                  {ventasFiltradas.length > 0 ? (
                    ventasFiltradas.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 border-b border-gray-200">
                        <td className="p-3 font-black">{v.numeroFactura}</td>
                        <td className="p-3">{v.Persona?.nombreCompleto}</td>
                        <td className="p-3 text-right font-mono">
                          ${parseFloat(v.totalFactura).toFixed(2)}
                        </td>
                        <td className="p-3 text-center flex justify-center gap-5 text-gray-400">
                          <MdPrint
                            className="cursor-pointer hover:text-black transition-colors"
                            size={18}
                          />
                          <MdDelete
                            className="cursor-pointer hover:text-red-600 transition-colors"
                            size={18}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-10 text-center text-gray-400 italic font-medium uppercase"
                      >
                        No se encontraron registros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[500px] flex flex-col items-center justify-center border-4 border-dashed border-gray-200">
          <FaBoxesStacked size={60} className="text-gray-200 mb-4 animate-pulse" />
          <h3 className="text-xl font-black uppercase text-gray-400">Cargando Sistema...</h3>
        </div>
      )}
    </Container>
  )
}

export default Ventas
