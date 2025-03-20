
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <nav className="bg-transparent p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">CargoFlow</h1>
          <div className="space-x-4">
            <Link href="/track" className="text-white hover:text-gray-300">Track Shipment</Link>
            <Link href="/login" className="text-white hover:text-gray-300">Login</Link>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Global Shipping Solutions</h2>
          <p className="text-xl text-gray-300 mb-8">Fast, reliable, and secure cargo services worldwide</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-white mb-4">Track Your Shipment</h3>
              <input 
                type="text" 
                placeholder="Enter tracking number"
                className="w-full p-2 rounded bg-white/5 border border-gray-600 text-white mb-4"
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Track Now
              </button>
            </div>
            
            <div className="bg-white/10 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-white mb-4">Get a Quote</h3>
              <select className="w-full p-2 rounded bg-white/5 border border-gray-600 text-white mb-4">
                <option>Select Service Type</option>
                <option>Express Delivery</option>
                <option>Standard Shipping</option>
                <option>Economy</option>
              </select>
              <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                Calculate Rate
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
