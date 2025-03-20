
import { AramexTracking } from "@/components/aramex/tracking";

export default function Tracking() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Shipment</h1>
        <AramexTracking />
      </div>
    </div>
  );
}
