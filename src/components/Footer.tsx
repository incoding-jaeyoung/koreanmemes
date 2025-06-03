'use client'

import { 
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-blue-400" />
              <div className="flex flex-col">
                <span className="font-bold text-xl">Korean Memes</span>
                <span className="text-sm text-gray-400">Korean to Global</span>
              </div>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md text-sm">
              A platform for sharing Korean humor, culture, and trends with the world. 
              Discover the charm of K-culture together!
            </p>
          </div>
        </div> */}

        {/* Social Links Section */}
        {/* <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <h4 className="font-medium text-gray-300">Follow Us</h4>
              <div className="flex items-center space-x-4">
                <a 
                  href="https://github.com/incoding" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com/incoding" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://instagram.com/incoding" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div> */}

        {/* Bottom Copyright */}
        <div className="text-center justify-center">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-400 text-sm mb-2 md:mb-0">
              © {currentYear} <span className="font-medium text-blue-400">koreanmemes</span>. All rights reserved.
            </p>
            {/* <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>in Seoul, Korea</span>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  )
} 