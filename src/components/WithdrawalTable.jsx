'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function WithdrawalTable({ withdrawals: initialWithdrawals }) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals)
  const [processing, setProcessing] = useState(null)

  const handleAction = async (id, action) => {
    setProcessing(id)
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      })
      const data = await res.json()
      if (res.ok) {
        setWithdrawals(prev =>
          prev.map(w => w.id === id ? { ...w, status: action } : w)
        )
      } else {
        alert(data.error || 'Failed to update')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="badge badge-warning flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</span>
      case 'approved': return <span className="badge badge-success flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>
      case 'rejected': return <span className="badge badge-error flex items-center"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>
      default: return status
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-secondary-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Account</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-200">
          {withdrawals.map((w) => (
            <tr key={w.id}>
              <td className="px-6 py-4">
                <div className="font-medium">{w.user.name || 'N/A'}</div>
                <div className="text-sm text-secondary-500">{w.user.email}</div>
              </td>
              <td className="px-6 py-4 font-medium">${w.amount.toFixed(2)}</td>
              <td className="px-6 py-4">{w.method}</td>
              <td className="px-6 py-4 font-mono text-sm">{w.account}</td>
              <td className="px-6 py-4">{getStatusBadge(w.status)}</td>
              <td className="px-6 py-4 text-sm">
                {new Date(w.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {w.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAction(w.id, 'approved')}
                      disabled={processing === w.id}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleAction(w.id, 'rejected')}
                      disabled={processing === w.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {withdrawals.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-secondary-500">
                No withdrawal requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}