'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Wallet, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

const PAYMENT_METHODS = [
  { id: 'BINANCE', name: 'Binance Pay', icon: '💰', placeholder: 'USDT wallet address (BEP20/TRC20)' },
  { id: 'BKASH', name: 'bKash', icon: '📱', placeholder: '01XXXXXXXXX' },
  { id: 'NAGAD', name: 'Nagad', icon: '📱', placeholder: '01XXXXXXXXX' },
  { id: 'ROCKET', name: 'Rocket', icon: '📱', placeholder: '01XXXXXXXXX' },
]

export default function WithdrawPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('BINANCE')
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (session) fetchBalance()
  }, [session])

  const fetchBalance = async () => {
    const res = await fetch('/api/user/balance')
    const data = await res.json()
    if (res.ok) setBalance(data.balance)
  }

  const validateForm = () => {
    const numAmount = parseFloat(amount)
    if (!amount || numAmount <= 0) return 'Please enter a valid amount'
    if (numAmount > balance) return 'Insufficient balance'
    if (numAmount < 5) return 'Minimum withdrawal is $5'
    if (!account.trim()) return `Please enter your ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name} details`
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/withdraw/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method: selectedMethod,
          account
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Withdrawal request submitted! Admin will review it soon.')
        setAmount('')
        setAccount('')
        fetchBalance() // ব্যালেন্স আপডেট না হলেও দেখাবে, কারণ এখনও কাটেনি
      } else {
        setError(data.error || 'Request failed')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <div className="text-center py-20">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        <button onClick={() => router.push('/dashboard')} className="text-secondary-600 hover:text-secondary-900 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </button>
      </div>

      <div className="card p-6 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-secondary-600">Available Balance</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">New Withdrawal Request</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50"
              min="5"
              step="0.01"
              className="input-field"
              required
            />
            <p className="text-xs text-secondary-500 mt-1">Minimum: $5</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    selectedMethod === method.id
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{method.icon}</span>
                  <span className="text-sm font-medium">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name} Details
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={PAYMENT_METHODS.find(m => m.id === selectedMethod)?.placeholder}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>

          <p className="text-xs text-center text-secondary-500">
            Requests are reviewed within 24 hours. You will be notified once approved.
          </p>
        </form>
      </div>
    </div>
  )
}