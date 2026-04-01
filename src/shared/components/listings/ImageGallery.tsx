'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, Grid, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ListingImage } from '@/types/listing.types'

interface Props {
  images: ListingImage[]
  title: string
}

export function ImageGallery({ images, title }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const next = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }, [images.length])

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!showModal) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showModal, prev, next])

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showModal])

  if (!images.length) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 flex items-center justify-center">
        <span className="text-7xl select-none">🏠</span>
      </div>
    )
  }

  const main = images[0]
  const sides = images.slice(1, 5)

  return (
    <>
      {/* Gallery grid */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[280px] sm:h-[380px] md:h-[460px]">
        {/* Main image */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer"
          onClick={() => { setActiveIndex(0); setShowModal(true) }}
        >
          <Image
            src={main.url}
            alt={title}
            fill
            className="object-cover hover:brightness-95 transition-all duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Side images */}
        {Array.from({ length: 4 }).map((_, i) => {
          const img = sides[i]
          return (
            <div
              key={i}
              className="relative hidden md:block cursor-pointer"
              onClick={() => { setActiveIndex(i + 1); setShowModal(true) }}
            >
              {img ? (
                <Image
                  src={img.url}
                  alt={`${title} photo ${i + 2}`}
                  fill
                  className="object-cover hover:brightness-95 transition-all duration-300"
                  sizes="25vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
            </div>
          )
        })}

        {/* Show all photos button */}
        <button
          onClick={() => { setActiveIndex(0); setShowModal(true) }}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-[#222] text-sm font-semibold px-4 py-2 rounded-xl border border-[#b0b0b0] hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Grid className="w-4 h-4" />
          Show all photos
        </button>
      </div>

      {/* Lightbox modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fadeIn">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <span className="text-white/70 text-sm">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setShowModal(false)}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main viewer */}
          <div className="flex-1 flex items-center justify-center relative px-16">
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-4xl h-full max-h-[calc(100vh-200px)]">
              <Image
                src={images[activeIndex].url}
                alt={`${title} photo ${activeIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 px-6 py-4 justify-center overflow-x-auto scrollbar-hide shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 ring-2 transition-all ${
                    activeIndex === i ? 'ring-white opacity-100' : 'ring-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
