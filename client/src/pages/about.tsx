
export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-700 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">About Us</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Our Story</h2>
          <p className="text-gray-600 mb-8">
            We are a leading global provider of comprehensive logistics and transportation solutions.
            Established with a vision to make global shipping accessible and efficient.
          </p>
          
          <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">Striving for the highest standards in everything we do</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">Embracing new technologies and solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
