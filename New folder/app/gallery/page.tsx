import ImageGrid from '../../components/ImageGrid'
import { allImages } from '../../data/albums'

export default function Gallery(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Gallery</h1>
      <p className="mb-4 text-gray-600">All images from every album.</p>
      <ImageGrid images={allImages} />
    </div>
  )
}
