'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewAdPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    sourceType: 'DIRECT', // 'DIRECT' or 'ADSTERRA'
    // DIRECT fields
    videoUrl: '',
    videoType: 'direct', // 'direct' or 'youtube'
    advertiser: '',
    costPerView: '',
    userShare: '',
    // ADSTERRA fields
    adTagUrl: '',
    // common
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate based on sourceType
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
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          costPerView: formData.costPerView ? parseFloat(formData.costPerView) : null,
          userShare: formData.userShare ? parseFloat(formData.userShare) : null,
        })
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin/ads')
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to create ad')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Ad</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
      Direct Ad (Video File or YouTube)
    </label>
    <label className="inline-flex items-center">
      <input
        type="radio"
        name="sourceType"
        value="EXOCLICK"  // 'ADSTERRA' থেকে পরিবর্তন করে 'EXOCLICK' করুন
        checked={formData.sourceType === 'EXOCLICK'}
        onChange={handleChange}
        className="mr-2"
      />
      ExoClick VAST Ad  // লেবেল আপডেট করুন
    </label>
  </div>
</div>

        {/* Conditional Fields for DIRECT */}
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
                placeholder="https://example.com/video.mp4 or YouTube ID"
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
                <option value="direct">Direct Video File (MP4, WebM)</option>
                <option value="youtube">YouTube Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Advertiser Name</label>
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
              <label className="block text-sm font-medium mb-1">Cost Per View (৳) - What advertiser pays</label>
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
              <label className="block text-sm font-medium mb-1">User Share (৳) - What user earns</label>
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

        {formData.sourceType === 'EXOCLICK' && (
  <div>
    <label className="block text-sm font-medium mb-1">VAST Ad Tag URL (from ExoClick)</label>
    <input
      type="url"
      name="adTagUrl"
      value={formData.adTagUrl}
      onChange={handleChange}
      required
      className="w-full p-2 border rounded"
      placeholder="https://servedby.exoclick.com/vast.php?id=12345"
    />
    <p className="text-xs text-gray-500 mt-1">
      ExoClick ড্যাশবোর্ড থেকে ভিডিও জোন তৈরি করে এই URL কপি করে পেস্ট করুন।
	  https://s.magsrv.com/v1/vast.php?idzone=5853944
    </p>
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
          <label className="ml-2 text-sm">Active (ad will be shown to users)</label>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Ad'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}