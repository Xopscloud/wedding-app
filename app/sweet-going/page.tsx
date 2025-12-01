"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SweetGoing(){
  const router = useRouter()
  useEffect(()=>{ router.replace('/madhuramveppu') }, [router])
  return null
}
