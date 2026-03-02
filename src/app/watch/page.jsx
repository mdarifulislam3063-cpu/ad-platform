'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Play, DollarSign, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

// ==================== ইউটিলিটি ফাংশন ====================
function extractYouTubeId(url) {
  if (!url) return null
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[1].length === 11) ? match[1] : null
}

// ExoClick VAST Player Component
function VastPlayer({ adTagUrl, onAdComplete }) {
  const videoRef = useRef(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    let adsLoader = null
    let adsManager = null

    const loadIMA = () => {
      if (!window.google || !window.google.ima) {
        const script = document.createElement('script')
        script.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js'
        script.async = true
        script.onload = initPlayer
        script.onerror = () => {
          console.error('IMA SDK failed to load')
          if (mounted.current) {
            setError(true)
            setLoading(false)
          }
        }
        document.head.appendChild(script)
      } else {
        initPlayer()
      }
    }

    const initPlayer = () => {
      if (!videoRef.current || !window.google?.ima) {
        console.error('Video ref or IMA not ready')
        return
      }

      try {
        const video = videoRef.current
        const adDisplayContainer = new window.google.ima.AdDisplayContainer(video, video)
        adsLoader = new window.google.ima.AdsLoader(adDisplayContainer)

        adsLoader.addEventListener(
          window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          onAdsManagerLoaded
        )
        adsLoader.addEventListener(
          window.google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdError
        )

        const request = new window.google.ima.AdsRequest()
        request.adTagUrl = adTagUrl
        request.linearAdSlotWidth = video.clientWidth
        request.linearAdSlotHeight = video.clientHeight

        adsLoader.requestAds(request)
        adDisplayContainer.initialize()
        console.log('Ads requested')
      } catch (e) {
        console.error('Init error:', e)
        setError(true)
        setLoading(false)
      }
    }

    const onAdsManagerLoaded = (event) => {
      if (!mounted.current) return
      try {
        adsManager = event.getAdsManager(videoRef.current)
        adsManager.addEventListener(
          window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
          () => {
            console.log('Ad completed')
            if (mounted.current && onAdComplete) onAdComplete()
          }
        )
        adsManager.init(
          videoRef.current.clientWidth,
          videoRef.current.clientHeight,
          window.google.ima.ViewMode.NORMAL
        )
        adsManager.start()
        setLoading(false)
      } catch (e) {
        console.error('AdsManager error:', e)
        setError(true)
        setLoading(false)
      }
    }

    const onAdError = (err) => {
      console.error('Ad error:', err)
      if (mounted.current) {
        setError(true)
        setLoading(false)
        if (onAdComplete) onAdComplete()
      }
    }

    loadIMA()

    return () => {
      mounted.current = false
      if (adsManager) adsManager.destroy()
      if (adsLoader) {
        adsLoader.removeEventListener(
          window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          onAdsManagerLoaded
        )
        adsLoader.removeEventListener(
          window.google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdError
        )
      }
    }
  }, [adTagUrl, onAdComplete])

  if (error) {
    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl flex items-center justify-center text-white">
        <AlertCircle className="w-12 h-12 text-yellow-500" />
        <p className="ml-3">Ad failed to load. Skipping...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
      <video ref={videoRef} className="w-full h-full" autoPlay playsInline muted />
    </div>
  )
}

// ==================== ডাইরেক্ট ভিডিও প্লেয়ার ====================
function DirectVideoPlayer({ ad, onVideoEnd }) {
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [ytLoaded, setYtLoaded] = useState(false)

  useEffect(() => {
    if (ad?.videoType !== 'youtube') return

    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      tag.onload = () => console.log('YouTube API script loaded')
      document.head.appendChild(tag)
    }

    const onReady = () => {
      console.log('YouTube API ready')
      setYtLoaded(true)
    }

    if (window.YT) {
      onReady()
    } else {
      window.onYouTubeIframeAPIReady = onReady
    }

    return () => {
      window.onYouTubeIframeAPIReady = null
    }
  }, [ad?.videoType])

  useEffect(() => {
    if (ad?.videoType !== 'youtube' || !ytLoaded || !window.YT) return

    const videoId = extractYouTubeId(ad.videoUrl)
    console.log('Extracted videoId:', videoId, 'from URL:', ad.videoUrl)

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      console.error('Invalid YouTube video ID:', videoId)
      if (onVideoEnd) onVideoEnd()
      return
    }

    console.log('Creating YouTube player for videoId:', videoId)

    const timer = setTimeout(() => {
      try {
        if (playerRef.current) {
          playerRef.current.destroy()
        }

        playerRef.current = new window.YT.Player(`youtube-player-${ad.id}`, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              console.log('YouTube player ready')
              event.target.playVideo()
              setPlayerReady(true)
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                console.log('YouTube video ended')
                onVideoEnd()
              }
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data)
              if (onVideoEnd) onVideoEnd()
            },
          },
        })
      } catch (error) {
        console.error('Error creating YouTube player:', error)
        if (onVideoEnd) onVideoEnd()
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [ad?.videoType, ytLoaded, ad?.videoUrl, ad?.id, onVideoEnd])

  if (ad?.videoType === 'youtube') {
    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
        <div 
          ref={containerRef}
          id={`youtube-player-${ad.id}`} 
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
      <video
        key={ad?.id}
        src={ad?.videoUrl}
        controls
        onEnded={onVideoEnd}
        className="w-full h-full"
        autoPlay
        playsInline
      />
    </div>
  )
}

// ==================== মূল ওয়াচ পেজ ====================
export default function WatchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ads, setAds] = useState([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads')
      const data = await res.json()
      console.log('Fetched ads:', data)
      setAds(data)
    } catch (error) {
      console.error('Failed to fetch ads', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoEnd = async (adId) => {
    if (videoEnded) return
    setVideoEnded(true)

    try {
      const res = await fetch('/api/user/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId })
      })
      const data = await res.json()
      if (res.ok) {
        setMessageType('success')
        setMessage(`🎉 Earned ৳${data.earned}!`)

        if (currentAdIndex < ads.length - 1) {
          setTimeout(() => {
            setCurrentAdIndex(prev => prev + 1)
            setVideoEnded(false)
            setMessage('')
          }, 2000)
        } else {
          setMessageType('info')
          setMessage('You have watched all ads for now. Come back later!')
        }
      } else {
        setMessageType('error')
        setMessage(data.error || 'Failed to record view')
        setVideoEnded(false)
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error recording view')
      setVideoEnded(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-secondary-600">Loading ads...</p>
        </div>
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="bg-secondary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-secondary-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Ads Available</h2>
          <p className="text-secondary-600 mb-8">Please check back later for new ads.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentAd = ads[currentAdIndex]

  // safety guard: যদি currentAd undefined হয়, তাহলে error দেখান (প্রোডাকশনে না আসার কথা)
  if (!currentAd) {
    console.error('Current ad is undefined', { ads, currentAdIndex })
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ad Error</h2>
          <p className="text-secondary-600">Could not load the current ad. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Watch & Earn</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-secondary-600 hover:text-secondary-900 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start ${
              messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
              messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
              'bg-blue-50 border border-blue-200 text-blue-700'
            }`}
          >
            {messageType === 'success' ? <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> :
             messageType === 'error' ? <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> :
             <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />}
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-sm bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full">
              Ad {currentAdIndex + 1} of {ads.length}
            </span>
            {currentAd.sourceType === 'DIRECT' && (
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Earn ৳{currentAd.userShare}
              </span>
            )}
            {currentAd.sourceType === 'EXOCLICK' && (
              <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium flex items-center">
                <Play className="w-4 h-4 mr-1" />
                ExoClick Ad
              </span>
            )}
          </div>

          <h2 className="text-xl font-semibold">{currentAd.title}</h2>

          {currentAd.sourceType === 'EXOCLICK' ? (
            <VastPlayer
              key={currentAd.id}
              adTagUrl={currentAd.adTagUrl}
              onAdComplete={() => handleVideoEnd(currentAd.id)}
            />
          ) : (
            <DirectVideoPlayer
              ad={currentAd}
              onVideoEnd={() => handleVideoEnd(currentAd.id)}
            />
          )}

          <div className="bg-secondary-50 p-4 rounded-lg text-sm text-secondary-600 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-secondary-400" />
            <p>
              {currentAd.sourceType === 'EXOCLICK'
                ? 'Watch the ad completely to earn. Ad may be skipped after a few seconds.'
                : 'Watch the full video to earn reward. Make sure your video is fully played.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}