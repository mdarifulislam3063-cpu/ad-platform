import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Wallet, Eye, Calendar, ArrowRight, Clock, TrendingUp, Award } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      adViews: {
        orderBy: { watchedAt: 'desc' },
        take: 10,
        include: { ad: true }
      }
    }
  })

  if (!user) redirect('/login')

  const totalWatched = await prisma.adView.count({
    where: { userId: user.id }
  })

  const totalEarned = user.adViews.reduce((sum, view) => sum + (view.ad?.userShare || 0), 0)

  const stats = [
    { icon: Wallet, label: 'Current Balance', value: `৳${user.balance?.toFixed(2) || '0.00'}`, color: 'bg-green-100 text-green-600' },
    { icon: Eye, label: 'Total Views', value: totalWatched, color: 'bg-blue-100 text-blue-600' },
    { icon: TrendingUp, label: 'Total Earned', value: `৳${totalEarned.toFixed(2)}`, color: 'bg-purple-100 text-purple-600' },
    { icon: Award, label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }), color: 'bg-orange-100 text-orange-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name || user.email}!</h1>
        <p className="text-secondary-600 mt-1">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-secondary-900">{stat.value}</span>
            </div>
            <p className="text-secondary-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/watch" className="btn-primary flex items-center justify-center space-x-2">
          <span>Start Watching Ads</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/withdraw" className="btn-secondary flex items-center justify-center space-x-2">
          <span>Withdraw Earnings</span>
        </Link>
      </div>

      {/* Recent Watch History */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-5 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary-600" />
          Recent Watch History
        </h2>

        {user.adViews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Ad Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Earned</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">Watched At</th>
                </tr>
              </thead>
              <tbody>
                {user.adViews.map((view) => (
                  <tr key={view.id} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{view.ad?.title || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-success">৳{view.ad?.userShare?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td className="py-3 px-4 text-secondary-600">
                      {new Date(view.watchedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No ads watched yet</h3>
            <p className="text-secondary-600 mb-6">Start watching ads to see your history here.</p>
            <Link href="/watch" className="btn-primary">
              Browse Ads
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}