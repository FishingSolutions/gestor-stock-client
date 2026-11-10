import { BarChart3, FolderTree, LayoutDashboard, Package, Tag } from 'lucide-react'

/**
 * Configuración de las secciones de la Sidebar.
 * `to` es opcional: si falta, el ítem se renderiza como botón deshabilitado
 * (entrada de menú "de muestra" sin ruta todavía).
 */
export const sidebarSections = [
  {
    title: 'Principal',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/', end: true }],
  },
  {
    title: 'Inventario',
    items: [
      { icon: Package, label: 'Productos', to: '/productos' },
      { icon: Tag, label: 'Movimientos', to: '/movimientos' },
      { icon: FolderTree, label: 'Categorías' },
      { icon: FolderTree, label: 'Stock bajo' },
    ],
  },
  {
    title: 'Sistema',
    items: [{ icon: BarChart3, label: 'Configuración' }],
  },
]
