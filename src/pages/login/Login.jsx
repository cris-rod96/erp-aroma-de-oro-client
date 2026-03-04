import { useState } from 'react'
import { MdEmail } from 'react-icons/md'
import { authAPI } from '../../api/index.api'
import { AxiosError } from 'axios'

const Login = () => {
  const [credentials, setCredentials] = useState({
    cedula: '',
    clave: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((credential) => ({
      ...credential,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const credentialsExists = Object.values(credentials).every((data) => data !== '')

    if (!credentialsExists) {
      console.error('Las credenciales son obligatorias')
      return
    }

    authAPI
      .loginWithCredentials(credentials)
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        if (err instanceof AxiosError) {
          console.error(err.response.data.message)
        } else {
          console.error('Error desconocido. Intente más tarde')
        }
      })
  }

  return (
    <main className="w-full h-screen overflow-hidden flex flex-row bg-[#F5F9FF] grid-cols-2">
      <div className="w-full lg:flex hidden  bg-amber-200 flex-row justify-center items-center">
        <div className="relative w-full h-screen">
          <img
            src="/fondo_cacao.jpg"
            alt=""
            className="absolute w-full h-full inset-0 object-cover"
          />
        </div>
      </div>

      <div className="w-full h-full flex flex-row justify-center items-center">
        <form action="" className="w-[60%] flex flex-col gap-10" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="cedula" className="font-semibold text-xl">
              Cédula
            </label>
            <div className="flex h-14 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-gray-300">
              <input
                type="text"
                name="cedula"
                onChange={handleChange}
                minLength={10}
                maxLength={10}
                autoComplete="off"
                className="flex-1 h-full outline-none px-2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-semibold text-xl">
              Contraseña
            </label>
            <div className="flex h-14 bg-white rounded-lg overflow-hidden border border-gray-200 focus-within:border-gray-300">
              <input
                type="password"
                name="clave"
                onChange={handleChange}
                autoComplete="off"
                className="flex-1 h-full outline-none px-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ffbf00] text-lg uppercase font-bold text-[#482200] py-4 flex justify-center items-center rounded-lg hover:bg-[#e29300] transition-all cursor-pointer"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  )
}

export default Login
