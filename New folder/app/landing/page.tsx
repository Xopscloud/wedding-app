'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Landing() {
  const router = useRouter()

  const openAlbums = () => {
    router.push('/albums')
  }

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/images/landing/DSC03522.JPG"
        alt="Landing"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Click area to open albums - full screen invisible button */}
      <button
        onClick={openAlbums}
        aria-label="Enter albums"
        className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
      />
    </div>
  )
}
