import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100%" };
const center = { lat: 25.9951, lng: -80.2966 }; // Pembroke Pines, FL

export default function MapView() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"], // optional
  });
  
  if (!isLoaded) return(
  <div className="m-5 flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Map Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Community Map</h3>
          <p className="text-sm text-gray-600">Click on markers to see details</p>
        </div>
        
        {/* Map Container */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-lg font-medium">Interactive Community Map</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="m-5 flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Map Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Community Map</h3>
          <p className="text-sm text-gray-600">Click on markers to see details</p>
        </div>
        
        {/* Map Container */}
        <div className="flex-1 relative">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
            <Marker position={center} title="Community Location" />
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}
