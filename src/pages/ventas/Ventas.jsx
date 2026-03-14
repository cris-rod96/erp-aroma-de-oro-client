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
} from 'react-icons/md'
import { FaBoxesStacked } from 'react-icons/fa6'
import Swal from 'sweetalert2'
import { Container } from '../../components/index.components'
import { compradorAPI, empresaAPI, productoAPI, ventaAPI } from '../../api/index.api'
import { useAuthStore } from '../../store/useAuthStore'

const Ventas = () => {
  const token = useAuthStore((store) => store.token)
  const usuarioLogueado = useAuthStore((store) => store.user)

  // --- ESTADOS DE DATOS ---
  const [empresa, setEmpresa] = useState({ nombre: '', ruc: '', direccion: '' })
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
    abonoManual: '',
    esCredito: false,
    ivaPorcentaje: 15,
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

      setEmpresa(respEmp.data.empresa || {})
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
  }, [])

  // --- LÓGICA DE NEGOCIO ---
  const productoActual = useMemo(
    () => productos.find((p) => p.id === formData.ProductoId),
    [formData.ProductoId, productos]
  )

  const calculos = useMemo(() => {
    const cant = parseFloat(formData.cantidad) || 0
    const prec = parseFloat(formData.precio) || 0
    const subtotal = cant * prec
    const iva = subtotal * (formData.ivaPorcentaje / 100)
    const totalFactura = subtotal + iva
    const abonado = formData.esCredito ? parseFloat(formData.abonoManual) || 0 : totalFactura
    const saldo = Math.max(0, totalFactura - abonado)

    // Validación de stock
    const stockExcedido = productoActual ? cant > parseFloat(productoActual.stock) : false

    return { subtotal, iva, totalFactura, abonado, saldo, stockExcedido }
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
    if (!cedulaBusqueda) return
    const encontrado = compradores.find((c) => c.numeroIdentificacion === cedulaBusqueda)
    if (encontrado) {
      setCompradorInfo(encontrado)
      setMostrarRegistroComprador(false)
      Swal.fire({
        icon: 'success',
        title: 'Cliente identificado',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      })
    } else {
      setCompradorInfo({ numeroIdentificacion: cedulaBusqueda, nombreCompleto: 'NO REGISTRADO' })
      setMostrarRegistroComprador(true)
    }
  }

  const handleFinalizarVenta = async () => {
    if (!compradorInfo?.id) return Swal.fire('Error', 'Seleccione un comprador', 'error')
    if (calculos.stockExcedido) return Swal.fire('Error', 'No hay stock suficiente', 'error')
    if (calculos.totalFactura <= 0) return Swal.fire('Error', 'Valores inválidos', 'error')

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar Factura?',
      text: `Total a cobrar: $${calculos.totalFactura.toFixed(2)}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Registro',
      confirmButtonColor: '#111827',
    })

    if (isConfirmed) {
      setLoading(true)
      try {
        const payload = {
          numeroFactura: `FAC-${Date.now().toString().slice(-6)}`,
          cantidadQuintales: formData.cantidad,
          precioUnitario: formData.precio,
          subtotal: calculos.subtotal,
          porcentajeIVA: formData.ivaPorcentaje,
          totalIva: calculos.iva,
          totalFactura: calculos.totalFactura,
          estado: calculos.saldo > 0 ? 'Crédito' : 'Cobrado',
          montoAbonado: calculos.abonado,
          montoPendiente: calculos.saldo,
          CompradorId: compradorInfo.id,
          ProductoId: formData.ProductoId,
          UsuarioId: usuarioLogueado.id,
        }
        await ventaAPI.crearVenta(payload, token)
        Swal.fire('Venta Exitosa', 'La factura ha sido registrada', 'success')
        setFormData((prev) => ({
          ...prev,
          cantidad: '',
          precio: '',
          abonoManual: '',
          esCredito: false,
        }))
        setCompradorInfo(null)
        setCedulaBusqueda('')
        fetchInicial()
      } catch (error) {
        Swal.fire('Error', 'No se pudo procesar la venta', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Container fullWidth={true}>
      {productos.length > 0 ? (
        <div className="w-full px-6 py-4 text-gray-800 bg-white font-sans">
          {/* CABECERA */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <MdBusiness size={45} className="text-gray-800" />
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                  {empresa.nombre}
                </h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                  RUC: {empresa.ruc} | Ventas Aroma de Oro
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black uppercase border-b-2 border-gray-800 px-2">
                Factura de Venta
              </h2>
              <p className="font-mono font-bold text-sm mt-1">
                {loading ? 'PROCESANDO...' : 'BORRADOR'}
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
                  type="text"
                  value={cedulaBusqueda}
                  onChange={(e) => setCedulaBusqueda(e.target.value)}
                  className="flex-1 border border-gray-800 p-2 text-sm font-bold uppercase outline-none focus:bg-gray-50"
                  placeholder="Buscar Comprador..."
                />
                <button
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
                className={`border border-gray-800 p-2 text-sm font-black uppercase h-[40px] flex items-center justify-between ${mostrarRegistroComprador ? 'bg-red-50 text-red-600 border-red-600' : 'bg-gray-50'}`}
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
              <button
                onClick={handleFinalizarVenta}
                className="mt-3 bg-gray-900 text-white font-black text-[10px] uppercase p-3 px-10 hover:bg-black"
              >
                Registrar e Importar
              </button>
            </div>
          )}

          {/* TABLA DE PRODUCTO */}
          <div className="mb-8">
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
                  <th className="p-2 border-r border-gray-600 text-center w-32">Cant. (QQ)</th>
                  <th className="p-2 border-r border-gray-600 text-center w-32">Precio ($)</th>
                  <th className="p-2 text-right w-40">Total ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={`border-b border-gray-800 font-bold ${calculos.stockExcedido ? 'bg-red-50' : ''}`}
                >
                  <td className="p-3 border-r border-gray-800 font-black text-sm uppercase">
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
                  <td className="p-3 border-r border-gray-800">
                    <input
                      type="number"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className={`w-full text-center font-mono text-xl outline-none bg-transparent ${calculos.stockExcedido ? 'text-red-600' : ''}`}
                      placeholder="0.00"
                    />
                  </td>
                  <td className="p-3 border-r border-gray-800">
                    <input
                      type="number"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full text-center font-mono text-xl outline-none bg-transparent"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="p-3 text-right font-mono text-xl bg-gray-50">
                    ${calculos.subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="border border-gray-800 p-4 space-y-4">
              <p className="text-[10px] font-black uppercase border-b border-gray-800 pb-1 text-gray-400">
                Forma de Cobro
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormData({ ...formData, esCredito: false })}
                  className={`flex-1 p-3 text-[10px] font-black border border-gray-800 transition-all ${!formData.esCredito ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  CONTADO
                </button>
                <button
                  onClick={() => setFormData({ ...formData, esCredito: true })}
                  className={`flex-1 p-3 text-[10px] font-black border border-gray-800 transition-all ${formData.esCredito ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  CRÉDITO
                </button>
              </div>
              {formData.esCredito && (
                <div className="animate-in slide-in-from-top-1">
                  <label className="text-[9px] font-black uppercase mb-1 block text-gray-500 italic">
                    Monto de Abono Inicial
                  </label>
                  <input
                    type="number"
                    value={formData.abonoManual}
                    onChange={(e) => setFormData({ ...formData, abonoManual: e.target.value })}
                    className="w-full border border-gray-800 p-2 font-mono font-black text-lg outline-none focus:bg-emerald-50"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="border-2 border-gray-800 p-4 bg-gray-50 shadow-inner">
              <div className="text-[11px] font-black uppercase space-y-2 mb-4 border-b border-gray-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculos.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>IVA ({formData.ivaPorcentaje}%):</span>
                  <span>${calculos.iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-black pt-2 text-gray-900">
                  <span>TOTAL A COBRAR:</span>
                  <span>${calculos.totalFactura.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white border border-gray-800 p-2">
                  <p className="text-[9px] font-black text-gray-500 uppercase">Abonado</p>
                  <p className="text-xl font-mono font-black text-emerald-700">
                    ${calculos.abonado.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`border p-2 ${calculos.saldo > 0 ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-300 border-gray-300'}`}
                >
                  <p className="text-[9px] font-black uppercase">Saldo Pendiente</p>
                  <p className="text-xl font-mono font-black">${calculos.saldo.toFixed(2)}</p>
                </div>
              </div>
              <button
                disabled={loading || calculos.stockExcedido}
                onClick={handleFinalizarVenta}
                className={`w-full font-black py-4 uppercase text-xs mt-4 transition-all ${loading || calculos.stockExcedido ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]'}`}
              >
                {loading ? 'Registrando...' : 'Emitir Factura de Venta'}
              </button>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="mt-10">
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
                  placeholder="BUSCAR FACTURA O CLIENTE..."
                  value={filtroHistorial}
                  onChange={(e) => setFiltroHistorial(e.target.value)}
                  className="w-full border border-gray-300 p-2 pl-8 text-[10px] font-bold uppercase outline-none focus:border-gray-800"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100 text-[10px] font-black uppercase text-gray-600">
                  <tr>
                    <th className="p-3 border border-gray-300 text-left">Factura Nº</th>
                    <th className="p-3 border border-gray-300 text-left">Cliente / Comprador</th>
                    <th className="p-3 border border-gray-300 text-left">Producto</th>
                    <th className="p-3 border border-gray-300 text-right">Total</th>
                    <th className="p-3 border border-gray-300 text-right">Saldo</th>
                    <th className="p-3 border border-gray-300 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold uppercase">
                  {ventasFiltradas.length > 0 ? (
                    ventasFiltradas.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                      >
                        <td className="p-3 font-black text-gray-900">{v.numeroFactura}</td>
                        <td className="p-3">{v.Persona?.nombreCompleto}</td>
                        <td className="p-3 text-gray-500">{v.Producto?.nombre}</td>
                        <td className="p-3 text-right font-mono">
                          ${parseFloat(v.totalFactura).toFixed(2)}
                        </td>
                        <td
                          className={`p-3 text-right font-mono ${v.montoPendiente > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                        >
                          ${parseFloat(v.montoPendiente).toFixed(2)}
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
                      <td colSpan="6" className="p-10 text-center text-gray-400 italic">
                        No se encontraron registros de ventas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full px-6 py-4 bg-white font-sans flex flex-col gap-5 justify-center items-center h-[500px] border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 p-8 rounded-full shadow-inner">
            <FaBoxesStacked size={60} className="text-gray-300" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black uppercase text-gray-800">Bodega Vacía</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              No hay productos registrados o con stock disponible para realizar ventas en este
              momento.
            </p>
          </div>
        </div>
      )}
    </Container>
  )
}

export default Ventas
