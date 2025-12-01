import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'

export default function Wedding(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Wedding</h1>
      <p className="mb-4 text-gray-600">Ceremony, portraits, and celebrations.</p>
      <ImageGrid images={albums.wedding} />
    </div>
  )
}
