'use client'

"use client"

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Landing() {
  const router = useRouter()
  const [imgUrl, setImgUrl] = useState<string>('/images/landing/DSC03522.JPG')
  const [best, setBest] = useState<Array<{id:number,title?:string,image:string,description?:string}>>([])

  const openAlbums = () => {
    router.push('/albums')
  }

  useEffect(() => {
    async function load() {
      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000')
      try {
        const res = await fetch(`${API_BASE}/api/settings/landing-image`)
        if (!res.ok) return
        const data = await res.json()
        if (data?.image) {
          // ensure full URL if backend returns a relative path (e.g. /uploads/..)
          const img = data.image.startsWith('/') ? `${API_BASE}${data.image}` : data.image
          setImgUrl(img)
        }
      } catch (e) {
        // ignore and keep default
      }
      // also load settings for home best moments (store moment ids)
      try{
        const sres = await fetch(`${API_BASE}/api/settings`)
        const mres = await fetch(`${API_BASE}/api/moments`)
        const sdata = sres.ok ? await sres.json() : {}
        const moments = mres.ok ? await mres.json() : []
        const bestIds = [1,2,3,4].map(n => sdata[`home:best:${n}`]).filter(Boolean)
        if(bestIds.length && moments.length){
          const resolved = bestIds.map((id:any) => {
            const mid = typeof id === 'string' && /^[0-9]+$/.test(id) ? parseInt(id,10) : id
            const m = moments.find((x:any)=> x.id === mid || String(x.id) === String(id) || x.title === id)
            if(!m) return null
            const img = (m.image && m.image.startsWith('/')) ? `${API_BASE}${m.image}` : m.image
            return { id: m.id, title: m.title, image: img, description: m.description }
          }).filter(Boolean) as Array<{id:number,title?:string,image:string,description?:string}>
          setBest(resolved)
        }
      }catch(e){}
    }
    load()
  }, [])

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

      {/* Best moments strip */}
      {best && best.length > 0 && (
        <div className="absolute left-1/2 top-[86%] -translate-x-1/2 transform w-full max-w-6xl px-4">
          <div className="bg-white/90 rounded-lg p-3 grid grid-cols-4 gap-4 shadow-md">
            {best.slice(0,4).map((m, i) => (
              <div key={m.id} className="flex flex-col items-start gap-2">
                <div className="w-full h-28 overflow-hidden rounded-sm">
                  <img src={m.image} alt={m.title || `best-${i}`} className="w-full h-full object-cover" />
                </div>
                <div className="text-sm font-medium">{m.title}</div>
                <div className="text-xs text-gray-500">{m.description}</div>
              </div>
            ))}
            <div className="col-span-1 flex items-center justify-center">
              <Link href="/moments"><a className="px-4 py-2 border rounded text-sm">More</a></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
