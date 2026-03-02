import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-[80vh] gap-6">
      <AdminSidebar />
      <main className="flex-1 bg-white rounded-xl shadow-sm p-6">
        {children}
      </main>
    </div>
  )
}