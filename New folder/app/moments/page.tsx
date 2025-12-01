import ImageGrid from '../../components/ImageGrid'
import { highlightMoments } from '../../data/albums'

export default function Moments(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Moments</h1>
      <p className="mb-4 text-gray-600">A curated selection of highlights from across all albums.</p>
      <ImageGrid images={highlightMoments} />
    </div>
  )
}
