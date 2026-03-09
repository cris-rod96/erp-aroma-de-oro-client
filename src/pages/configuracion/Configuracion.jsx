import { useState } from 'react'
import {
  MdOutlineSecurity,
  MdBusiness,
  MdBadge,
  MdSave,
  MdCloudUpload,
  MdAlternateEmail,
  MdPhoneIphone,
} from 'react-icons/md'
import { Container } from '../../components/index.components'

const Configuracion = () => {
  const [userData, setUserData] = useState({
    nombre: 'Cristhian Rodríguez',
    cedula: '0940501596',
    email: 'admin@aromadeoro.com',
    telefono: '0967148226',
    rol: 'Administrador',
  })

  const [empresaData, setEmpresaData] = useState({
    ruc: '0999999999001',
    razonSocial: 'COMERCIALIZADORA AROMA DE ORO S.A.',
    direccion: 'Velasco Ibarra, Guayas, Ecuador',
    telefono: '042-XXX-XXXX',
  })

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }

  const handleEmpresaChange = (e) => {
    setEmpresaData({ ...empresaData, [e.target.name]: e.target.value })
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-4 md:px-8 py-4">
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-400 pl-4">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
              Configuración del Sistema
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              Gestione su perfil, seguridad y parámetros de la organización
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
          {/* LADO IZQUIERDO: PERFIL Y SEGURIDAD */}
          <div className="xl:col-span-2 space-y-8">
            {/* CARD: PERFIL */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <MdBadge className="text-amber-500" size={20} />
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Información Personal
                </h2>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={userData.nombre}
                    onChange={handleUserChange}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-amber-400 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Identificación (Cédula)
                  </label>
                  <input
                    type="text"
                    value={userData.cedula}
                    readOnly
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-400 cursor-not-allowed font-mono shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <MdAlternateEmail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleUserChange}
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-amber-400 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Teléfono Celular
                  </label>
                  <div className="relative">
                    <MdPhoneIphone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                      size={18}
                    />
                    <input
                      type="text"
                      name="telefono"
                      value={userData.telefono}
                      onChange={handleUserChange}
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-amber-400 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                  <button className="bg-gray-900 hover:bg-gray-800 text-amber-400 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 italic">
                    <MdSave size={18} /> Actualizar Perfil
                  </button>
                </div>
              </div>
            </div>

            {/* CARD: SEGURIDAD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <MdOutlineSecurity className="text-red-500" size={20} />
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Seguridad de la Cuenta
                </h2>
              </div>
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="password"
                  placeholder="CLAVE ACTUAL"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-red-400 transition-all"
                />
                <input
                  type="password"
                  placeholder="NUEVA CLAVE"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-400 transition-all"
                />
                <input
                  type="password"
                  placeholder="REPETIR CLAVE"
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-400 transition-all"
                />
                <div className="md:col-span-3 flex justify-end pt-2">
                  <button className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic">
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: EMPRESA */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <MdBusiness className="text-amber-500" size={20} />
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Datos de Empresa
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 group hover:border-amber-200 transition-all cursor-pointer">
                  <MdCloudUpload
                    className="text-gray-300 group-hover:text-amber-400 transition-colors"
                    size={40}
                  />
                  <span className="text-[9px] font-black text-gray-400 uppercase mt-2 tracking-widest">
                    Logotipo Institucional
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Razón Social
                    </label>
                    <input
                      type="text"
                      name="razonSocial"
                      value={empresaData.razonSocial}
                      onChange={handleEmpresaChange}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Número de RUC
                    </label>
                    <input
                      type="text"
                      name="ruc"
                      value={empresaData.ruc}
                      onChange={handleEmpresaChange}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none font-mono focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Dirección Matriz
                    </label>
                    <textarea
                      name="direccion"
                      rows="3"
                      value={empresaData.direccion}
                      onChange={handleEmpresaChange}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none resize-none focus:border-amber-400"
                    ></textarea>
                  </div>
                </div>

                <button className="w-full bg-gray-900 hover:bg-gray-800 text-amber-400 py-4 rounded-2xl text-[10px] font-black shadow-xl transition-all flex justify-center items-center gap-2 uppercase tracking-[0.2em] italic">
                  <MdSave size={18} /> Guardar Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Configuracion
