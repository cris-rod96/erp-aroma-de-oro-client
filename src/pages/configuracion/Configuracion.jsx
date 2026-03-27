import { useState, useEffect } from 'react'
import {
  MdOutlineSecurity,
  MdBusiness,
  MdBadge,
  MdSave,
  MdAlternateEmail,
  MdPhoneIphone,
  MdLock,
} from 'react-icons/md'
import { Container } from '../../components/index.components'
import { useAuthStore } from '../../store/useAuthStore'
import { empresaAPI, usuarioAPI } from '../../api/index.api'
import Swal from 'sweetalert2'
import { useEmpresaStore } from '../../store/useEmpresaStore'

const Configuracion = () => {
  // 1. Sincronización con el nuevo Store simplificado
  const user = useAuthStore((state) => state.user) // Antes era infoData
  const token = useAuthStore((state) => state.token)
  const updateUser = useAuthStore((state) => state.updateUser) // Antes era setAdminData
  const setEmpresa = useEmpresaStore((state) => state.setEmpresa)

  const [loading, setLoading] = useState(false)

  const [userData, setUserData] = useState({
    nombresCompletos: '',
    cedula: '',
    correo: '',
    telefono: '',
  })

  const [passwordData, setPasswordData] = useState({
    nuevaClave: '',
    repetirClave: '',
  })

  const [empresaData, setEmpresaData] = useState({
    id: null,
    ruc: '',
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
  })

  // Carga de datos de la empresa
  const fetchEmpresaData = async () => {
    try {
      const resp = await empresaAPI.obtenerInformacion(token)
      if (resp.data && resp.data.empresa) {
        setEmpresaData(resp.data.empresa)
        setEmpresa(resp.data.empresa)
      }
    } catch (error) {
      console.error('Error al cargar información de la empresa:', error)
    }
  }

  // Efecto para hidratar el formulario con los datos del usuario logueado
  useEffect(() => {
    if (user) {
      setUserData({
        nombresCompletos: user.nombresCompletos || '',
        cedula: user.cedula || '',
        correo: user.correo || '',
        telefono: user.telefono || '',
      })
    }
  }, [user])

  useEffect(() => {
    fetchEmpresaData()
  }, [])

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }

  const handleEmpresaChange = (e) => {
    setEmpresaData({ ...empresaData, [e.target.name]: e.target.value })
  }

  const actualizarInformacionUsuario = async () => {
    try {
      setLoading(true)
      const resp = await usuarioAPI.actualizarUsuario(user.id, userData, token)

      if (resp.status === 200) {
        updateUser(userData) // Actualiza el store global con los nuevos datos
        Swal.fire({
          icon: 'success',
          title: 'Perfil Actualizado',
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const actualizarEmpresa = async () => {
    if (!empresaData.nombre || !empresaData.ruc) {
      return Swal.fire('Atención', 'Nombre y RUC son obligatorios', 'warning')
    }

    try {
      setLoading(true)
      let resp
      if (empresaData.id) {
        resp = await empresaAPI.actualizarInformacion(empresaData.id, empresaData, token)
      } else {
        resp = await empresaAPI.crearEmpresa(token, empresaData)
      }

      if (resp.status === 200 || resp.status === 201) {
        const empresaActualizada = resp.data.empresa || empresaData
        setEmpresa(empresaActualizada)
        setEmpresaData(empresaActualizada)
        Swal.fire({
          icon: 'success',
          title: 'Empresa Actualizada',
          timer: 1500,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la empresa', 'error')
    } finally {
      setLoading(false)
    }
  }

  const actualizarPassword = async () => {
    const { nuevaClave, repetirClave } = passwordData

    if (!nuevaClave || !repetirClave) {
      return Swal.fire('Atención', 'Debes completar ambos campos', 'warning')
    }
    if (nuevaClave !== repetirClave) {
      return Swal.fire('Error', 'Las contraseñas no coinciden', 'error')
    }
    if (nuevaClave.length < 6) {
      return Swal.fire('Atención', 'Mínimo 6 caracteres', 'warning')
    }

    try {
      setLoading(true)
      const resp = await usuarioAPI.actualizarClave(user.id, nuevaClave, token)
      if (resp.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Seguridad Actualizada',
          timer: 2000,
          showConfirmButton: false,
        })
        setPasswordData({ nuevaClave: '', repetirClave: '' })
      }
    } catch (error) {
      const mensajeError = error.response?.data?.message || 'Error al cambiar contraseña'
      Swal.fire('Error', mensajeError, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Validación de acceso para la sección de empresa
  const tieneAccesoEmpresa = user?.rol === 'Administrador' || user?.rol === 'Contador'

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter leading-none">
              Configuración
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
              Aroma de Oro - Perfil y Organización
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
          <div className="xl:col-span-2 space-y-8">
            {/* SECCIÓN PERFIL */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                <MdBadge className="text-amber-500" size={24} />
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Información Personal del {user?.rol || 'Usuario'}
                </h2>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombresCompletos"
                    value={userData.nombresCompletos}
                    onChange={handleUserChange}
                    className="h-14 w-full bg-white border border-gray-200 rounded-2xl px-5 text-sm font-bold text-gray-700 outline-none focus:border-amber-400 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Cédula (No editable)
                  </label>
                  <div className="h-14 w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 flex items-center text-sm font-black text-gray-400 font-mono shadow-inner">
                    {userData.cedula}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <MdAlternateEmail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                      size={20}
                    />
                    <input
                      type="email"
                      name="correo"
                      value={userData.correo}
                      onChange={handleUserChange}
                      className="h-14 w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 text-sm font-bold text-gray-700 outline-none focus:border-amber-400 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <MdPhoneIphone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                      size={20}
                    />
                    <input
                      type="text"
                      name="telefono"
                      value={userData.telefono}
                      onChange={handleUserChange}
                      className="h-14 w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 text-sm font-bold text-gray-700 outline-none focus:border-amber-400 shadow-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                  <button
                    disabled={loading}
                    className="bg-gray-900 hover:bg-black text-amber-400 px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 flex items-center gap-3 disabled:opacity-50 transition-all border-b-4 border-amber-600"
                    onClick={actualizarInformacionUsuario}
                  >
                    <MdSave size={20} /> {loading ? 'Sincronizando...' : 'Actualizar Perfil'}
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN SEGURIDAD */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                <MdOutlineSecurity className="text-rose-500" size={24} />
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Seguridad y Credenciales
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <MdLock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={20}
                      />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.nuevaClave}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, nuevaClave: e.target.value })
                        }
                        className="h-14 w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 text-sm outline-none focus:border-rose-400 shadow-sm transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <MdLock
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                        size={20}
                      />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.repetirClave}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, repetirClave: e.target.value })
                        }
                        className="h-14 w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 text-sm outline-none focus:border-rose-400 shadow-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    disabled={loading}
                    className="bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    onClick={actualizarPassword}
                  >
                    {loading ? 'Procesando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA EMPRESA (Sólo Admins/Contadores) */}
          {tieneAccesoEmpresa && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden sticky top-4">
                <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                  <MdBusiness className="text-amber-500" size={24} />
                  <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Identidad Corporativa
                  </h2>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Razón Social
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={empresaData.nombre}
                        onChange={handleEmpresaChange}
                        className="h-12 w-full border border-gray-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        RUC
                      </label>
                      <input
                        type="text"
                        name="ruc"
                        value={empresaData.ruc}
                        onChange={handleEmpresaChange}
                        className="h-12 w-full border border-gray-200 rounded-xl px-4 text-sm font-black font-mono outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Teléfono Empresa
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={empresaData.telefono}
                        onChange={handleEmpresaChange}
                        className="h-12 w-full border border-gray-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Correo Corporativo
                      </label>
                      <input
                        type="email"
                        name="correo"
                        value={empresaData.correo}
                        onChange={handleEmpresaChange}
                        className="h-12 w-full border border-gray-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Dirección
                      </label>
                      <textarea
                        name="direccion"
                        rows="3"
                        value={empresaData.direccion}
                        onChange={handleEmpresaChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none resize-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={actualizarEmpresa}
                    disabled={loading}
                    className="w-full bg-[#111827] hover:bg-black text-amber-400 py-5 rounded-[1.5rem] text-[10px] font-black shadow-2xl transition-all uppercase tracking-[0.2em] border-b-4 border-amber-600 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <MdSave size={20} className={loading ? 'animate-spin' : ''} />
                    <span>{loading ? 'Guardando...' : 'Sincronizar Empresa'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export default Configuracion
