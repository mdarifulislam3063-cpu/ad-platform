import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AdPlatform - Watch Videos & Earn Money',
  description: 'Earn money by watching video ads. Withdraw your earnings easily via bKash, Nagad, or Rocket.',
  keywords: 'earn money, watch ads, video ads, online earning',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}