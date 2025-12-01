import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'

export default function PreWedding(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Pre-Wedding</h1>
      <p className="mb-4 text-gray-600">Getting ready, rehearsals, and behind-the-scenes.</p>
      <ImageGrid images={albums.preWedding} />
    </div>
  )
}
