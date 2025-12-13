"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageData {
  src: string
  alt: string
  width?: number
  height?: number
}

interface AdaptiveImageGridProps {
  images: ImageData[]
  gap?: number
  minWidth?: number
  onImageClick?: (src: string) => void
}

export default function AdaptiveImageGrid({ 
  images, 
  gap = 16, 
  minWidth = 200,
  onImageClick
}: AdaptiveImageGridProps) {
  const [imageData, setImageData] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImageDimensions()
  }, [images])

  const loadImageDimensions = async () => {
    setLoading(true)
    const promises = images.map((img) => {
      return new Promise<ImageData>((resolve) => {
        const image = new window.Image()
        image.onload = () => {
          resolve({
            ...img,
            width: image.naturalWidth,
            height: image.naturalHeight
          })
        }
        image.onerror = () => {
          resolve({
            ...img,
            width: 300,
            height: 200
          })
        }
        image.src = img.src
      })
    })

    const results = await Promise.all(promises)
    setImageData(results)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((_, idx) => (
          <div key={idx} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
        ))}
      </div>
    )
  }

  return (
    <div 
      className="masonry-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: `${gap}px`,
        gridAutoRows: '10px'
      }}
    >
      {imageData.map((img, idx) => {
        const aspectRatio = img.width && img.height ? img.width / img.height : 1
        // Normalize aspect ratios - clamp between 0.7 and 1.5 for similar sizes
        const normalizedRatio = Math.max(0.7, Math.min(1.5, aspectRatio))
        const gridHeight = Math.ceil((minWidth / normalizedRatio + gap) / 10)
        
        return (
          <button
            key={idx}
            onClick={() => onImageClick?.(img.src)}
            className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
            style={{
              gridRowEnd: `span ${gridHeight}`
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width || 300}
              height={img.height || 200}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        )
      })}
    </div>
  )
}