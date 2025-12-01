import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'

export default function Engagement(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Engagement</h1>
      <p className="mb-4 text-gray-600">Engagement photos and candid moments.</p>
      <ImageGrid images={albums.engagement} />
    </div>
  )
}
