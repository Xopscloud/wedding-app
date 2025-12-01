"use client"

import Link from 'next/link'

type Props = {
  title: string
  description: string
  href: string
  image: string
}

export default function AlbumSectionCard({title, description, href, image}: Props){
  return (
    <Link href={href} className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200 bg-white">
      <div className="h-44 md:h-56 w-full bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </Link>
  )
}
