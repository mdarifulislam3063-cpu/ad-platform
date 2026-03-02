'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  DollarSign,
  LogOut 
} from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Ads', href: '/admin/ads', icon: Video },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: DollarSign },
  ]

  return (
    <aside className="w-64 bg-white rounded-xl shadow-sm p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary-600 px-2">Admin Panel</h2>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}

        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  )
}