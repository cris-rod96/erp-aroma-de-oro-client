import { TbBellFilled, TbLayoutDashboardFilled } from 'react-icons/tb'
import { BiSolidBusiness } from 'react-icons/bi'
import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { TbCashRegister } from 'react-icons/tb'
export const MENU_DATA = [
  {
    path: '/inicio',
    label: 'Panel principal',
    icon: TbLayoutDashboardFilled,
  },

  {
    path: '/inicio/cajas',
    label: 'Cajas',
    icon: TbCashRegister,
  },

  {
    path: '/inicio/productores',
    label: 'Productores',
    icon: FaTruckFast,
  },

  {
    path: '/inicio/usuarios',
    label: 'Usuarios',
    icon: FaUsers,
  },

  {
    path: '/inicio/inventario',
    label: 'Inventario',
    icon: FaBoxesStacked,
  },

  {
    path: '/inicio/kardex',
    label: 'Kardex',
    icon: FaTruckLoading,
  },

  {
    path: '/inicio/nomina',
    label: 'Nómina',
    icon: GrUserWorker,
  },

  {
    path: '/inicio/compras',
    label: 'Compras',
    icon: FaShoppingBasket,
  },

  {
    path: '/inicio/ventas',
    label: 'Ventas',
    icon: GiCash,
  },

  {
    path: '/inicio/reportes',
    label: 'Reportes',
    icon: FaFilePdf,
  },

  {
    path: '/inicio/cuentas-por-pagar',
    label: 'Cuentas por pagar',
    icon: GiPayMoney,
  },

  {
    path: '/inicio/cuentas-por-cobrar',
    label: 'Cuentas por cobrar',
    icon: GiReceiveMoney,
  },

  {
    path: '/inicio/configuracion',
    label: 'Configuración',
    icon: GiGears,
  },
  {
    path: '/inicio/alertas', // La nueva ruta
    label: 'Estilo de Alertas',
    icon: TbBellFilled, // Icono de campana: universal para notificaciones/alertas
  },
]
