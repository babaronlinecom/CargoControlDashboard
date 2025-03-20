
import { Link } from "wouter";

export default function Solutions() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Logistics Solutions</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Supply Chain Solutions</h2>
            <p className="text-gray-600 mb-4">End-to-end supply chain management and optimization.</p>
            <Link href="/contact" className="text-red-600 hover:text-red-700">Learn More →</Link>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">E-commerce Solutions</h2>
            <p className="text-gray-600 mb-4">Integrated logistics solutions for online businesses.</p>
            <Link href="/contact" className="text-red-600 hover:text-red-700">Learn More →</Link>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Custom Solutions</h2>
            <p className="text-gray-600 mb-4">Tailored logistics solutions for unique requirements.</p>
            <Link href="/contact" className="text-red-600 hover:text-red-700">Learn More →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
