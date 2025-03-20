
import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <a className="text-2xl font-bold text-red-600">Aramex</a>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/track">
              <a className="text-gray-700 hover:text-red-600">Track</a>
            </Link>
            <Link href="/ship">
              <a className="text-gray-700 hover:text-red-600">Ship</a>
            </Link>
            <Link href="/solutions">
              <a className="text-gray-700 hover:text-red-600">Solutions</a>
            </Link>
            <Link href="/locations">
              <a className="text-gray-700 hover:text-red-600">Locations</a>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <a className="text-gray-700 hover:text-red-600">Login</a>
            </Link>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Ship Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
