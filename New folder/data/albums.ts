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
  sweetGoing: [
    "/images/sweet-going/1.jpg",
    "/images/sweet-going/2.jpg"
  ],
  preWedding: [
    "/images/pre-wedding/1.jpg",
    "/images/pre-wedding/2.jpg"
  ]
}

export const allImages = Object.values(albums).flat()

export const highlightMoments = [
  albums.wedding[0],
  albums.engagement[1],
  albums.saveTheDate[0],
  albums.preWedding[0]
]
