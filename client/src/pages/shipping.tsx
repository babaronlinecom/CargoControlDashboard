
import { Link } from "wouter";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shipping Services</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Express Shipping</h2>
            <p className="text-gray-600 mb-4">Fast and reliable delivery for time-sensitive shipments.</p>
            <Link href="/contact" className="text-red-600 hover:text-red-700">Learn More →</Link>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">International Shipping</h2>
            <p className="text-gray-600 mb-4">Global shipping solutions for worldwide delivery.</p>
            <Link href="/contact" className="text-red-600 hover:text-red-700">Learn More →</Link>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Freight Services</h2>
            <p className="text-gray-600 mb-4">Bulk shipping solutions for large cargo.</p>
            <Link href="/contact" className="text-red-600 hover:text-red-700">Learn More →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
