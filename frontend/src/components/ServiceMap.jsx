import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// Fix for default marker icons in Vite/Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for customer location
const customerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter map when location changes
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const ServiceMap = ({ customerLocation, radius, providers }) => {
    // Default to Colombo if no location provided
    const center = customerLocation || { lat: 6.9271, lng: 79.8612 };
    
    return (
        <div className="w-full h-[500px] rounded-3xl overflow-hidden shadow-sm border border-gray-200 z-0">
            <MapContainer 
                center={[center.lat, center.lng]} 
                zoom={12} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <RecenterAutomatically lat={center.lat} lng={center.lng} />

                {/* Customer Location Marker & Radius Circle */}
                {customerLocation && (
                    <>
                        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
                            <Popup><strong>You are here</strong></Popup>
                        </Marker>
                        <Circle 
                            center={[customerLocation.lat, customerLocation.lng]} 
                            radius={radius * 1000} // Convert km to meters
                            pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue', weight: 1 }}
                        />
                    </>
                )}

                {/* Provider Markers */}
                {providers && providers.map(p => (
                    <Marker key={p.provider_id} position={[p.lat, p.lng]}>
                        <Popup className="rounded-xl">
                            <div className="min-w-[200px] p-1">
                                <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                                <p className="text-blue-600 font-bold text-sm mb-2">{p.category_name}</p>
                                
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                        <Star size={14} fill="currentColor" /> {p.average_rating}
                                    </div>
                                    <span className="font-bold text-gray-900">Rs. {p.hourly_rate}/hr</span>
                                </div>
                                
                                {p.distance && (
                                    <p className="text-xs text-gray-500 mb-3 font-medium border-t pt-2">
                                        📍 {p.distance.toFixed(1)} km away
                                    </p>
                                )}
                                
                                <Link 
                                    to={`/provider/${p.provider_id}`} 
                                    className="block text-center w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default ServiceMap;
