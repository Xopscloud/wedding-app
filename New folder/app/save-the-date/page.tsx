import ImageGrid from '../../components/ImageGrid'
import { albums } from '../../data/albums'

export default function SaveTheDate(){
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Save the Date</h1>
      <p className="mb-4 text-gray-600">Snapshots from our save the date session.</p>
      <ImageGrid images={albums.saveTheDate} />
    </div>
  )
}
