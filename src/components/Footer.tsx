export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-gray-900">Civils Adda</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your trusted platform for competitive exam preparation. Practice with expert-curated mock tests and ace your exams.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors duration-200">
                <span className="text-gray-700 hover:text-blue-600 text-lg">📘</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors duration-200">
                <span className="text-gray-700 hover:text-blue-600 text-lg">🐦</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors duration-200">
                <span className="text-gray-700 hover:text-blue-600 text-lg">📷</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors duration-200">
                <span className="text-gray-700 hover:text-blue-600 text-lg">💼</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-gray-900">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/tests" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  All Tests
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/cart" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Cart
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-gray-900">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="/tests?category=polity" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Polity
                </a>
              </li>
              <li>
                <a href="/tests?category=history" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  History
                </a>
              </li>
              <li>
                <a href="/tests?category=economy" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Economy
                </a>
              </li>
              <li>
                <a href="/tests?category=geography" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Geography
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-gray-900">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 text-sm hover:text-blue-600 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div className="text-center sm:text-left">
            © {currentYear} Civils Adda. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-6 text-sm">
            <span className="text-gray-500">Made with ❤️ for aspirants</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
