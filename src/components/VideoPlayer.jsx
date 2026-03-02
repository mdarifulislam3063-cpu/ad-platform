'use client'
import ReactPlayer from 'react-player'
import { useState, useRef } from 'react'

export default function VideoPlayer({ url, onComplete }) {
  const [played, setPlayed] = useState(0)
  const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false)
  const playerRef = useRef(null)

  const handleProgress = (progress) => {
    setPlayed(progress.played)
    // Trigger onComplete when 90% played (to avoid counting if user skips last second)
    if (!hasTriggeredComplete && progress.played > 0.9) {
      setHasTriggeredComplete(true)
      onComplete()
    }
  }

  return (
    <div className="aspect-video bg-black">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={true}
        controls={true}
        onProgress={handleProgress}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload' // prevent download
            }
          }
        }}
      />
    </div>
  )
}