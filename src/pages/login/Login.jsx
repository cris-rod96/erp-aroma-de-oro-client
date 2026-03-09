import { useState } from 'react'
import { MdBadge, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import authAPI from '../../api/auth/auth.api'
import { useAuthStore } from '../../store/useAuthStore'
import { useEffect } from 'react'
import { client, server } from '../../config/index.config'

const Login = () => {
  const [credentials, setCredentials] = useState({ cedula: '', clave: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login) // Extraemos la acción de login

  const toastAroma = Swal.mixin({
    customClass: {
      popup: 'rounded-[2rem] border-2 border-amber-400 bg-gray-900 text-white',
      title: 'text-white font-black uppercase italic tracking-tighter',
      confirmButton:
        'bg-amber-400 text-amber-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs',
    },
    buttonsStyling: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!credentials.cedula || !credentials.clave) {
      return toastAroma.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor, ingrese su cédula y contraseña.',
        iconColor: '#fbbf24',
      })
    }

    setLoading(true)

    try {
      const response = await authAPI.loginWithCredentials(credentials)
      console.log(response.data)

      loginStore(response.data)

      toastAroma
        .fire({
          icon: 'success',
          title: '¡Acceso Concedido!',
          text: `Bienvenido, ${response.data.usuario.nombresCompletos}`,
          iconColor: '#fbbf24',
          timer: 1500,
          showConfirmButton: false,
        })
        .then(() => {
          navigate('/inicio')
        })
    } catch (error) {
      console.error(error)
      const message = error.response?.data?.message || 'Error al intentar iniciar sesión'

      toastAroma.fire({
        icon: 'error',
        title: 'Error de Acceso',
        text: message,
        confirmButtonText: 'Reintentar',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative w-full h-screen flex flex-row overflow-hidden bg-gray-900">
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-white/10">
        <img
          src="/fondo_cacao.jpg"
          alt="Cacao"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-12 flex flex-col justify-end">
          <h2 className="text-white text-5xl font-black italic uppercase leading-none">
            Sistema de Gestión <br /> <span className="text-amber-400">Aroma de Oro</span>
          </h2>
        </div>
      </div>

      <div className="relative w-full lg:w-1/2 flex justify-center items-center p-6 md:p-16">
        <div className="w-full max-w-md bg-white/5 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-8 lg:p-0 rounded-3xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-white italic uppercase">Acceso</h1>
            <p className="text-amber-400 lg:text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
              Panel Administrativo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-300 lg:text-gray-400 uppercase tracking-widest ml-1 italic">
                Cédula de Identidad
              </label>
              <div className="flex items-center h-14 bg-white/5 lg:bg-gray-800/50 rounded-2xl border border-white/10 lg:border-gray-700 focus-within:border-amber-400 transition-all">
                <div className="px-4 text-amber-400">
                  <MdBadge size={22} />
                </div>
                <input
                  autoComplete="off"
                  type="text"
                  name="cedula"
                  placeholder="09XXXXXXXX"
                  onChange={handleChange}
                  className="flex-1 bg-transparent h-full outline-none text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-300 lg:text-gray-400 uppercase tracking-widest ml-1 italic">
                Contraseña Segura
              </label>
              <div className="flex items-center h-14 bg-white/5 lg:bg-gray-800/50 rounded-2xl border border-white/10 lg:border-gray-700 focus-within:border-amber-400 transition-all">
                <div className="px-4 text-amber-400">
                  <MdLock size={22} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="clave"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="flex-1 bg-transparent h-full outline-none text-white font-bold"
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
              className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-900/40 active:scale-95 flex justify-center items-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : (
                'Entrar ahora'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <span className="text-[9px] text-white/30 lg:text-gray-600 font-black uppercase tracking-[0.4em]">
              Aroma de oro | 2026
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
