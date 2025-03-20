import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-900">
          <div className="container mx-auto px-4 pt-32">
            <h1 className="text-5xl font-bold text-white mb-6">Global Shipping Solutions</h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Fast, reliable, and secure logistics services worldwide. Track shipments, calculate rates, and manage your deliveries all in one place.
            </p>
            <div className="bg-white rounded-lg p-6 max-w-2xl">
              <h2 className="text-2xl font-semibold mb-4">Track Your Shipment</h2>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Enter your tracking number"
                  className="flex-1 p-3 border rounded"
                />
                <button className="bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700">
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Express Delivery</h3>
              <p className="text-gray-600">Time-sensitive shipments delivered with priority handling</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Freight Services</h3>
              <p className="text-gray-600">Air, land, and sea freight solutions for your cargo</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Logistics Solutions</h3>
              <p className="text-gray-600">End-to-end supply chain management services</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}