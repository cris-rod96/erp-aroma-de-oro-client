import { useState } from 'react'
import {
  MdBadge,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdClose,
  MdSend,
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import authAPI from '../../api/auth/auth.api'
import { useAuthStore } from '../../store/useAuthStore'
import usuarioAPI from '../../api/usuario/usuario.api'

const Login = () => {
  const [credentials, setCredentials] = useState({ cedula: '', clave: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // NUEVOS ESTADOS PARA EL MODAL AGRANDADO
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const navigate = useNavigate()

  const loginAction = useAuthStore((state) => state.login)

  const toastAroma = Swal.mixin({
    customClass: {
      popup: 'rounded-[2rem] border-2 border-amber-400 bg-gray-900 text-white shadow-2xl',
      title: 'text-white font-black uppercase italic tracking-tighter text-xl',
      htmlContainer: 'text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed',
      confirmButton:
        'bg-amber-400 hover:bg-amber-500 text-amber-950 px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 mx-2',
      cancelButton:
        'bg-gray-800 hover:bg-gray-700 text-gray-400 px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all mx-2',
      input:
        'bg-gray-800 border-2 border-gray-700 rounded-2xl px-5 text-amber-400 font-bold outline-none focus:border-amber-400 text-center mx-auto',
    },
    buttonsStyling: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const cleanValue = name === 'cedula' ? value.trim() : value
    setCredentials((prev) => ({ ...prev, [name]: cleanValue }))
  }

  // LÓGICA DE ENVÍO DEL MODAL
  const handleSendRecovery = async (e) => {
    e.preventDefault()
    if (!recoveryEmail) return

    setSendingEmail(true)
    try {
      const resp = await usuarioAPI.recuperarClave(recoveryEmail)
      setShowRecoveryModal(false)
      setRecoveryEmail('')
      toastAroma.fire({
        icon: 'success',
        title: 'Correo Enviado',
        text: resp.data?.message || 'Revisa tu bandeja de entrada.',
        iconColor: '#fbbf24',
        timer: 3000,
        showConfirmButton: false,
      })
    } catch (error) {
      toastAroma.fire({
        icon: 'error',
        title: 'Error de Envío',
        text: error.response?.data?.message || 'No se pudo procesar la solicitud.',
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!credentials.cedula || !credentials.clave) {
      return toastAroma.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'Cédula y contraseña son requeridas.',
        iconColor: '#fbbf24',
      })
    }

    setLoading(true)

    try {
      const response = await authAPI.loginWithCredentials(credentials)
      loginAction(response.data)

      toastAroma
        .fire({
          icon: 'success',
          title: '¡Acceso Concedido!',
          text: `Bienvenido al sistema, ${response.data.usuario.nombresCompletos}`,
          iconColor: '#fbbf24',
          timer: 1500,
          showConfirmButton: false,
        })
        .then(() => {
          navigate('/inicio')
        })
    } catch (error) {
      const message = error.response?.data?.message || 'Error crítico en el servidor'
      toastAroma.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: message,
        confirmButtonText: 'Reintentar',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative w-full h-screen flex flex-row overflow-hidden bg-gray-900 font-sans">
      {/* SECCIÓN IZQUIERDA: BRANDING VISUAL */}
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-white/5">
        <img
          src="/fondo_cacao.jpg"
          alt="Cacao Export"
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent p-16 flex flex-col justify-end">
          <div className="border-l-8 border-amber-400 pl-8">
            <h2 className="text-white text-7xl font-black italic uppercase leading-[0.8] tracking-tighter">
              Aroma <br /> de <span className="text-amber-400">Oro</span>
            </h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.6em] mt-6">
              ERP de Gestión Agrícola | v2.0
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: PANEL DE ACCESO */}
      <div className="relative w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
              Login<span className="text-amber-400">.</span>
            </h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">
              Administración Central de Productores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Identificación (Cédula)
              </label>
              <div className="flex items-center h-16 bg-white/5 rounded-[1.25rem] border border-white/10 focus-within:border-amber-400/50 focus-within:bg-white/10 transition-all group">
                <div className="px-5 text-gray-500 group-focus-within:text-amber-400 transition-colors">
                  <MdBadge size={26} />
                </div>
                <input
                  type="text"
                  name="cedula"
                  autoComplete="off"
                  placeholder="09XXXXXXXX"
                  value={credentials.cedula}
                  onChange={handleChange}
                  className="flex-1 bg-transparent h-full outline-none text-white font-bold text-sm tracking-widest placeholder:text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Clave de Seguridad
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[9px] font-black text-amber-500/40 hover:text-amber-400 uppercase tracking-widest transition-colors italic"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div className="flex items-center h-16 bg-white/5 rounded-[1.25rem] border border-white/10 focus-within:border-amber-400/50 focus-within:bg-white/10 transition-all group">
                <div className="px-5 text-gray-500 group-focus-within:text-amber-400 transition-colors">
                  <MdLock size={26} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="clave"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={credentials.clave}
                  onChange={handleChange}
                  className="flex-1 bg-transparent h-full outline-none text-white font-bold tracking-[0.3em] placeholder:text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-5 text-gray-600 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <MdVisibilityOff size={22} /> : <MdVisibility size={22} />}
                </button>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-2xl shadow-amber-900/20 active:scale-[0.98] flex justify-center items-center border-b-4 border-amber-600 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                    Validando...
                  </div>
                ) : (
                  'Ingresar al Panel'
                )}
              </button>
            </div>
          </form>

          <footer className="mt-16 flex flex-col items-center gap-4">
            <div className="h-px w-16 bg-white/10"></div>
            <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.6em] text-center leading-loose">
              © 2026 Exportadora Aroma de Oro <br />
              El Empalme - Ecuador
            </p>
          </footer>
        </div>
      </div>

      {/* MODAL DE RECUPERACIÓN AGRANDADO Y LIMPIO */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-400"></div>

            <button
              onClick={() => setShowRecoveryModal(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <MdClose size={28} />
            </button>

            <div className="mb-12 text-left">
              <h3 className="text-gray-900 font-black text-4xl italic uppercase tracking-tighter">
                Recuperar <span className="text-amber-500">Acceso</span>
              </h3>
              <p className="text-gray-500 text-base font-medium mt-3 leading-relaxed">
                Ingresa tu correo electrónico. Te enviaremos una clave temporal para que puedas
                volver a ingresar.
              </p>
            </div>

            <form onSubmit={handleSendRecovery} className="space-y-8">
              <div className="space-y-3 text-left">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">
                  Correo Electrónico
                </label>
                <div className="flex items-center h-18 bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-amber-400 focus-within:bg-white transition-all group">
                  <div className="px-5 text-gray-400 group-focus-within:text-amber-500 transition-colors">
                    <MdEmail size={26} />
                  </div>
                  <input
                    autoFocus
                    type="email"
                    placeholder="ejemplo@correo.com"
                    autoComplete="off"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-700 text-lg font-semibold placeholder:text-gray-300 pr-5"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingEmail}
                className="w-full py-5 bg-gray-900 hover:bg-black text-amber-400 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-4 shadow-2xl shadow-gray-200"
              >
                {sendingEmail ? (
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Restablecer Cuenta <MdSend size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Login
