// app/admin/page.jsx
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const totalUsers = await prisma.user.count()
  const totalAds = await prisma.ad.count()
  const totalViews = await prisma.adView.count()
  const pendingWithdrawals = await prisma.payment.count({ where: { status: 'pending' } })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={totalUsers} color="blue" />
        <StatCard title="Total Ads" value={totalAds} color="green" />
        <StatCard title="Total Views" value={totalViews} color="purple" />
        <StatCard title="Pending Withdrawals" value={pendingWithdrawals} color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAction title="Manage Ads" href="/admin/ads" description="Add, edit or delete ads" />
        <QuickAction title="Withdrawals" href="/admin/withdrawals" description="Approve or reject withdrawal requests" />
      </div>
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
  }
  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function QuickAction({ title, href, description }) {
  return (
    <Link href={href} className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  )
}