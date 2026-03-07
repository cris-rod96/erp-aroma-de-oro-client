import { useState } from 'react'
import { MdBadge, MdLock, MdErrorOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { authAPI } from '../../api/index.api'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [credentials, setCredentials] = useState({ cedula: '', clave: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/inicio')

    // setLoading(true)
    // // Simulación de validación y envío...
    // authAPI.loginWithCredentials(credentials).catch((err) => {
    //   if (err instanceof AxiosError) setError(err.response?.data?.message || 'Error de acceso')
    //   setLoading(false)
    // })
  }

  return (
    <main className="relative w-full h-screen flex flex-row overflow-hidden bg-gray-900">
      {/* FONDO PARA MÓVIL (Solo visible en pantallas pequeñas) */}
      <div className="absolute inset-0 lg:hidden">
        <img src="/fondo_cacao.jpg" alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* SECCIÓN IZQUIERDA: DISEÑO ESCRITORIO (Oculto en móvil) */}
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-white/10">
        <img
          src="/fondo_cacao.jpg"
          alt="Cacao"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-12 flex flex-col justify-end">
          <h2 className="text-white text-5xl font-black italic uppercase leading-none italic">
            Sistema de Gestión <br /> <span className="text-amber-400">Aroma de Oro</span>
          </h2>
          <p className="text-gray-300 mt-4 max-w-sm font-medium italic border-l-2 border-amber-400 pl-4">
            Gestión integral de liquidaciones, ventas y nómina
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO (Adaptable) */}
      <div className="relative w-full lg:w-1/2 flex justify-center items-center p-6 md:p-16">
        {/* Contenedor con efecto de cristal en móvil, limpio en desktop */}
        <div className="w-full max-w-md bg-white/10 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-8 lg:p-0 rounded-3xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-white italic uppercase">Acceso</h1>
            <p className="text-amber-400 lg:text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
              Panel Administrativo
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-headShake">
              <MdErrorOutline className="text-red-400" size={20} />
              <p className="text-red-100 text-[11px] font-bold uppercase italic">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CÉDULA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-300 lg:text-gray-400 uppercase tracking-widest ml-1 italic">
                Cédula de Identidad
              </label>
              <div className="flex items-center h-14 bg-white/5 lg:bg-gray-50 rounded-2xl border border-white/10 lg:border-gray-200 focus-within:border-amber-400 transition-all">
                <div className="px-4 text-amber-400">
                  <MdBadge size={22} />
                </div>
                <input
                  type="text"
                  name="cedula"
                  placeholder="09XXXXXXXX"
                  onChange={handleChange}
                  className="flex-1 bg-transparent h-full outline-none text-white lg:text-gray-700 font-bold"
                />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-300 lg:text-gray-400 uppercase tracking-widest ml-1 italic">
                Contraseña Segura
              </label>
              <div className="flex items-center h-14 bg-white/5 lg:bg-gray-50 rounded-2xl border border-white/10 lg:border-gray-200 focus-within:border-amber-400 transition-all">
                <div className="px-4 text-amber-400">
                  <MdLock size={22} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="clave"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="flex-1 bg-transparent h-full outline-none text-white lg:text-gray-700 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-gray-400 hover:text-amber-400"
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-900/20 active:scale-95 flex justify-center items-center"
            >
              {loading ? 'Verificando...' : 'Entrar ahora'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <span className="text-[9px] text-white/30 lg:text-gray-300 font-black uppercase tracking-[0.4em]">
              Aroma de oro | 2026
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
