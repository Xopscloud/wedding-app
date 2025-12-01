"use client"

import Link from 'next/link'
import Image from 'next/image'

type Props = {
  title: string
  description: string
  href: string
  image: string
}

export default function AlbumSectionCard({title, description, href, image}: Props){
  return (
    <Link href={href} className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200 bg-white">
      <div className="relative h-44 md:h-56 w-full bg-gray-100">
        <Image src={image} alt={title} fill className="object-cover" unoptimized />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </Link>
  )
}
