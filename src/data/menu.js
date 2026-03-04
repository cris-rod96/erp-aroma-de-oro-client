import { TbLayoutDashboardFilled } from 'react-icons/tb'
import { BiSolidBusiness } from 'react-icons/bi'
import { FaFilePdf, FaShoppingBasket, FaTruckLoading, FaUsers } from 'react-icons/fa'
import { FaBoxesStacked, FaTruckFast } from 'react-icons/fa6'
import { GiCash, GiGears, GiPayMoney, GiReceiveMoney } from 'react-icons/gi'
import { GrUserWorker } from 'react-icons/gr'
import { TbCashRegister } from 'react-icons/tb'
export const MENU_DATA = [
  {
    path: '/',
    label: 'Panel principal',
    icon: TbLayoutDashboardFilled,
  },

  {
    path: '/',
    label: 'Cajas',
    icon: TbCashRegister,
  },

  {
    path: '/',
    label: 'Productores',
    icon: FaTruckFast,
  },

  {
    path: '/',
    label: 'Usuarios',
    icon: FaUsers,
  },

  {
    path: '/',
    label: 'Inventario',
    icon: FaBoxesStacked,
  },

  {
    path: '/',
    label: 'Kardex',
    icon: FaTruckLoading,
  },

  {
    path: '/',
    label: 'Nómina',
    icon: GrUserWorker,
  },

  {
    path: '/',
    label: 'Compras',
    icon: FaShoppingBasket,
  },

  {
    path: '/',
    label: 'Ventas',
    icon: GiCash,
  },

  {
    path: '/',
    label: 'Reportes',
    icon: FaFilePdf,
  },

  {
    path: '/',
    label: 'Empresa',
    icon: BiSolidBusiness,
  },

  {
    path: '/',
    label: 'Cuentas por pagar',
    icon: GiPayMoney,
  },

  {
    path: '/',
    label: 'Cuentas por cobrar',
    icon: GiReceiveMoney,
  },

  {
    path: '/',
    label: 'Configuración',
    icon: GiGears,
  },
]
