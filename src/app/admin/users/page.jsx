// app/admin/users/page.jsx
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { adViews: true } } }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ads Watched</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.name || '-'}</td>
                <td className="px-6 py-4">৳{user.balance.toFixed(2)}</td>
                <td className="px-6 py-4">{user._count.adViews}</td>
                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}