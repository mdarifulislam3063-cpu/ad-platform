// app/admin/ads/page.jsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function AdsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const getSourceTypeLabel = (type) => {
    switch(type) {
      case 'DIRECT': return 'Direct';
      case 'ADSTERRA': return 'Adsterra VAST';
      default: return type;
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Ads</h1>
        <Link
          href="/admin/ads/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add New Ad
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advertiser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/View</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Share</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ads.map(ad => (
              <tr key={ad.id}>
                <td className="px-6 py-4">{ad.title}</td>
                <td className="px-6 py-4">{getSourceTypeLabel(ad.sourceType)}</td>
                <td className="px-6 py-4">{ad.advertiser || '-'}</td>
                <td className="px-6 py-4">{ad.costPerView ? `৳${ad.costPerView}` : '-'}</td>
                <td className="px-6 py-4">{ad.userShare ? `৳${ad.userShare}` : '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    ad.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {ad.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/ads/${ad.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}