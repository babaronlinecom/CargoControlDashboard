
export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-700 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <form className="bg-white p-8 rounded-lg shadow-md">
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Name</label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Email</label>
              <input type="email" className="w-full p-2 border rounded" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Message</label>
              <textarea className="w-full p-2 border rounded h-32"></textarea>
            </div>
            <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
