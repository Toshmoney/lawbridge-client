import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="container mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
        {/* Branding */}
        <div className="lg:px-10">
          <h3 className="text-xl font-bold text-blue-700">Lawbridge</h3>
          <p className="text-gray-600 mt-2">
            Smart legal documents & lawyer access for everyone.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600">Home</Link>
            </li>
            <li>
              <Link href="/#features" className="hover:text-blue-600">Features</Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-blue-600">Pricing</Link>
            </li>
            <li>
              <Link href="/#testimonials" className="hover:text-blue-600">Testimonials</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-3">Contact Us</h4>
          <p className="text-gray-600">📧 support@lawbridge.com.ng</p>
          <p className="text-gray-600">📞 +234 800 000 0000</p>
        </div>
      </div>

      <div className="border-t text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} Lawbridge. All rights reserved.
      </div>
    </footer>
  );
}
