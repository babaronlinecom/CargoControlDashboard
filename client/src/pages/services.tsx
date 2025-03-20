
export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-700 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Our Services</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Express Delivery */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Express Delivery</h3>
            <p className="text-gray-600">Time-sensitive shipments delivered with priority handling</p>
          </div>
          
          {/* Freight Services */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Freight Services</h3>
            <p className="text-gray-600">Air, land, and sea freight solutions for your cargo</p>
          </div>
          
          {/* Logistics Solutions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Logistics Solutions</h3>
            <p className="text-gray-600">End-to-end supply chain management services</p>
          </div>
        </div>
      </div>
    </div>
  );
}
