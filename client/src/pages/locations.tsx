
export default function Locations() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Locations</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">North America</h2>
            <p className="text-gray-600">123 Business Ave<br />New York, NY 10001<br />United States</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Europe</h2>
            <p className="text-gray-600">456 Commerce St<br />London, EC1A 1BB<br />United Kingdom</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Asia Pacific</h2>
            <p className="text-gray-600">789 Trade Rd<br />Singapore, 238801<br />Singapore</p>
          </div>
        </div>
      </div>
    </div>
  );
}
