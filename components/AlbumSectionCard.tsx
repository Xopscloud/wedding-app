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
    <Link href={href} className="group block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-1">
      <div className="relative h-32 w-full bg-gray-100">
        <Image src={image} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
      </div>
      <div className="p-3">
        <h3 className="font-serif text-sm font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}
