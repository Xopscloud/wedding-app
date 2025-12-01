import '../styles/globals.css'
import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Photo Album',
  description: 'A wedding-style photo album built with Next.js 14 and Tailwind CSS'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-[70vh] container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
