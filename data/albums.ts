export const albums = {
  saveTheDate: [
    "/images/save-the-date/1.jpg",
    "/images/save-the-date/2.jpg",
    "/images/save-the-date/3.jpg"
  ],
  engagement: [
    "/images/engagement/1.jpg",
    "/images/engagement/2.jpg",
    "/images/engagement/3.jpg"
  ],
  wedding: [
    "/images/wedding/1.jpg",
    "/images/wedding/2.jpg",
    "/images/wedding/3.jpg",
    "/images/wedding/4.jpg"
  ],
  madhuramveppu: [
    "/images/madhuramveppu/1.jpg",
    "/images/madhuramveppu/2.jpg"
  ],
  preWedding: [
    "/images/pre-wedding/1.jpg",
    "/images/pre-wedding/2.jpg"
  ],
  promiseOfAThousandTomorrows: [
    "/images/promise/1.jpg",
    "/images/promise/2.jpg"
  ]
}

// Static cover images for each album
export const albumCovers = {
  saveTheDate: "/images/covers/save-the-date-cover.jpg",
  engagement: "/images/covers/engagement-cover.jpg",
  wedding: "/images/covers/wedding-cover.jpg",
  madhuramveppu: "/images/covers/madhuramveppu-cover.jpg",
  preWedding: "/images/covers/pre-wedding-cover.jpg",
  promiseOfAThousandTomorrows: "/images/covers/promise-cover.jpg"
}

// Get full URL for cover images
export function getCoverImageUrl(albumKey: string, API_BASE: string): string {
  const coverPath = (albumCovers as any)[albumKey] || '/images/placeholder.jpg'
  return `${API_BASE}${coverPath}`
}

// Static button images
export const momentsButtonImage = "/images/covers/moments-cover.jpg"
export const galleryButtonImage = "/images/covers/gallery-cover.jpg"

// Get full URL for button images
export function getButtonImageUrl(buttonType: 'moments' | 'gallery', API_BASE: string): string {
  const imagePath = buttonType === 'moments' ? momentsButtonImage : galleryButtonImage
  return `${API_BASE}${imagePath}`
}

export const allImages = Object.values(albums).flat()

export const highlightMoments = [
  "/images/highlights/moment1.jpg",
  "/images/highlights/moment2.jpg",
  "/images/highlights/moment3.jpg",
  "/images/highlights/moment4.jpg"
]

// Get full URL for highlight moments
export function getHighlightImageUrl(index: number, API_BASE: string): string {
  const imagePath = highlightMoments[index] || highlightMoments[0]
  return `${API_BASE}${imagePath}`
}
