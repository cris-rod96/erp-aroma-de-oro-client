import { Container, KardexHeader, KardexTable } from '../../components/index.components'

import { useAuthStore } from '../../store/useAuthStore'
import { useKardex } from '../../hooks/useKardex'
import { exportarKardexPDF } from '../../utils/kardexExport'

const Kardex = () => {
  const token = useAuthStore((store) => store.token)
  const { cajaId, cajas, dataProcesada, filtroTipo, productos, setCajaId, setFiltroTipo } =
    useKardex(token)

  const handleExportPDF = () => {
    exportarKardexPDF(dataProcesada, cajas, cajaId, filtroTipo, productos)
  }

  return (
    <Container fullWidth={true}>
      <div className="w-full px-8 py-4">
        <KardexHeader
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          cajaId={cajaId}
          setCajaId={setCajaId}
          cajas={cajas}
          onExportPDF={handleExportPDF}
        />

        <KardexTable data={dataProcesada} productos={productos} />
      </div>
    </Container>
  )
}

export default Kardex
