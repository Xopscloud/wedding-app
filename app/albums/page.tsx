import HeroSection from '../../components/HeroSection'
import AlbumSectionCard from '../../components/AlbumSectionCard'
import ImageGrid from '../../components/ImageGrid'
import { albums, highlightMoments } from '../../data/albums'

export default function Albums(){
  return (
    <div className="space-y-8">
      <HeroSection />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AlbumSectionCard title="Save the Date" description="Our first promise" href="/save-the-date" image={albums.saveTheDate[0]} />
          <AlbumSectionCard title="Engagement" description="Rings and smiles" href="/engagement" image={albums.engagement[0]} />
          <AlbumSectionCard title="Wedding" description="The big day" href="/wedding" image={albums.wedding[0]} />
          <AlbumSectionCard title="Madhuramveppu" description="Afterparty moments" href="/madhuramveppu" image={albums.madhuramveppu[0]} />
          <AlbumSectionCard title="Pre-Wedding" description="Getting ready" href="/pre-wedding" image={albums.preWedding[0]} />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Best Moments</h3>
        <p className="text-sm text-gray-600 mb-4">Hand-picked highlights from across all albums.</p>
        <ImageGrid images={highlightMoments} />
      </section>

      <section className="mt-8">
        <div className="flex gap-3">
          <a href="/moments" className="px-4 py-2 bg-sage text-white rounded shadow">Moments</a>
          <a href="/gallery" className="px-4 py-2 bg-gold text-white rounded shadow">Gallery</a>
          <a href="/about" className="px-4 py-2 bg-blush text-white rounded shadow">About Us</a>
        </div>
      </section>
    </div>
  )
}
