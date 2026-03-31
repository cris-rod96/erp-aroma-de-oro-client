import { useEffect } from 'react'
import { useState } from 'react'
import { trabajadorAPI } from '../../api/index.api'
import { useAuthStore } from '../../store/useAuthStore'

const CumplesTrabajadores = ({ token }) => {
  const [cumplesHoy, setCumplesHoy] = useState([])
  const [cumplesManana, setCumplesManaa] = useState([])

  const fetchCumples = async () => {
    try {
      const resp = await trabajadorAPI.listarProximosCumples(token)
      console.log(resp.data)
      setCumplesHoy(resp.data.alertasHoy || [])
      setCumplesManaa(resp.data.alertasManana || [])
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchCumples()
  }, [])

  return (
    <div>
      <h2>Hi world</h2>
    </div>
  )
}

export default CumplesTrabajadores
