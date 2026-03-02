'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditAdPage() {
  const { id } = useParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    sourceType: 'DIRECT',
    videoUrl: '',
    videoType: 'direct',
    advertiser: '',
    costPerView: '',
    userShare: '',
    adTagUrl: '',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAd()
  }, [id])

  const fetchAd = async () => {
    try {
      const res = await fetch(`/api/admin/ads/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setFormData({
        title: data.title,
        sourceType: data.sourceType || 'DIRECT',
        videoUrl: data.videoUrl || '',
        videoType: data.videoType || 'direct',
        advertiser: data.advertiser || '',
        costPerView: data.costPerView?.toString() || '',
        userShare: data.userShare?.toString() || '',
        adTagUrl: data.adTagUrl || '',
        active: data.active
      })
    } catch (err) {
      setError('Could not load ad data')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.sourceType === 'DIRECT') {
      if (!formData.videoUrl || !formData.advertiser || !formData.costPerView || !formData.userShare) {
        setError('Please fill all direct ad fields')
        setLoading(false)
        return
      }
    } else {
      if (!formData.adTagUrl) {
        setError('Ad Tag URL is required for Adsterra ads')
        setLoading(false)
        return
      }
    }

    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          costPerView: formData.costPerView ? parseFloat(formData.costPerView) : null,
          userShare: formData.userShare ? parseFloat(formData.userShare) : null,
        })
      })
      if (res.ok) {
        router.push('/admin/ads')
      } else {
        const data = await res.json()
        setError(data.error || 'Update failed')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ad?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/ads')
      } else {
        alert('Delete failed')
      }
    } catch (err) {
      alert('Error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Ad</h1>
      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Ad Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Source Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Ad Source</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="sourceType"
                value="DIRECT"
                checked={formData.sourceType === 'DIRECT'}
                onChange={handleChange}
                className="mr-2"
              />
              Direct Ad
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="sourceType"
                value="ADSTERRA"
                checked={formData.sourceType === 'ADSTERRA'}
                onChange={handleChange}
                className="mr-2"
              />
              Adsterra VAST Ad
            </label>
          </div>
        </div>

        {/* DIRECT fields */}
        {formData.sourceType === 'DIRECT' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Video URL or YouTube ID</label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Video Type</label>
              <select
                name="videoType"
                value={formData.videoType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="direct">Direct Video File</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Advertiser</label>
              <input
                type="text"
                name="advertiser"
                value={formData.advertiser}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cost Per View (৳)</label>
              <input
                type="number"
                name="costPerView"
                value={formData.costPerView}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">User Share (৳)</label>
              <input
                type="number"
                name="userShare"
                value={formData.userShare}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}

        {/* ADSTERRA fields */}
        {formData.sourceType === 'ADSTERRA' && (
          <div>
            <label className="block text-sm font-medium mb-1">VAST Ad Tag URL</label>
            <input
              type="url"
              name="adTagUrl"
              value={formData.adTagUrl}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {/* Active checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label className="ml-2 text-sm">Active</label>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Update Ad'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 ml-auto"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}