'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Landing() {
  const router = useRouter()

  const openAlbums = () => {
    router.push('/albums')
  }

  const imgUrl = "/images/landing/DSC03522.JPG";

  return (
    <div className="fixed inset-0 bg-black overflow-hidden m-0 p-0">
      <Image
        src={imgUrl}
        alt="Landing"
        fill
        priority
        className="object-cover"
        unoptimized
        sizes="100vw"
      />

      {/* Names overlay as a centered single-line title + CTA button below */}
      <div className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 transform flex flex-col items-center justify-center sm:top-[68%] md:top-[70%] lg:top-[72%] px-4">
        <div className="text-center text-white">
          <div className="whitespace-nowrap font-quadrian text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4.5rem] leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">Aleena&nbsp;&amp;&nbsp;Jobin</div>
          <button onClick={openAlbums} aria-label="Explore moments" className="mt-4 px-5 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition">Explore moments</button>
        </div>
      </div>
    </div>
  )
}
