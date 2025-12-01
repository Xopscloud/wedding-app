import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'

export default function SweetGoing(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Sweet Going</h1>
      <p className="mb-4 text-gray-600">Joyful send-offs and candid moments.</p>
      <ImageGrid images={albums.sweetGoing} />
    </div>
  )
}
