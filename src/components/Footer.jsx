import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent mb-4">
              AdPlatform
            </h3>
            <p className="text-secondary-400 leading-relaxed">
              Watch videos, earn money, and withdraw easily. Join thousands of happy earners today.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-secondary-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/watch" className="text-secondary-400 hover:text-white transition-colors">Watch Ads</Link></li>
              <li><Link href="/dashboard" className="text-secondary-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-secondary-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-secondary-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="text-secondary-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-secondary-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-secondary-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div className="space-y-2 text-secondary-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@adplatform.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+880 1234 567890</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-secondary-800 mt-12 pt-8 text-center text-secondary-400">
          <p>&copy; {new Date().getFullYear()} AdPlatform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}