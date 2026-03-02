// components/AdminNav.jsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Ads', href: '/admin/ads' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Withdrawals', href: '/admin/withdrawals' },
  ]

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-6 overflow-x-auto py-3">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md ${
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}