import { Container, KardexHeader, KardexTable } from '../../components/index.components'

import { useAuthStore } from '../../store/useAuthStore'
import { useKardex } from '../../hooks/useKardex'
import { exportarKardexPDF } from '../../utils/kardexExport'

const Kardex = () => {
  const token = useAuthStore((store) => store.token)
  const {
    cajaId,
    cajas,
    dataProcesada,
    filtroTipo,
    productos,
    setCajaId,
    setFiltroTipo,
    filtroTiempo,
    error,
    fetching,
    setFiltroTiempo, // Traemos los nuevos estados
  } = useKardex(token)

  const handleExportPDF = () => {
    // Aquí luego pasaremos filtroTiempo para que el título del PDF cambie
    exportarKardexPDF(dataProcesada, cajas, cajaId, filtroTipo, productos, filtroTiempo)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        <KardexHeader
          error={error}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          filtroTiempo={filtroTiempo} // <-- Nuevo
          setFiltroTiempo={setFiltroTiempo} // <-- Nuevo
          cajaId={cajaId}
          setCajaId={setCajaId}
          cajas={cajas}
          onExportPDF={handleExportPDF}
          hasData={dataProcesada.length > 0}
        />
        <KardexTable data={dataProcesada} fetching={fetching} error={error} />
      </div>
    </Container>
  )
}

export default Kardex
