/**
 * Store Location Map Component
 * 
 * Displays the Stilnovo warehouse location with a beautiful Leaflet map
 * featuring custom blue theme matching the brand colors.
 * 
 * Location: Móstoles (near DGT)
 * Coordinates: 40.1920, -3.8660
 */

import React, { useEffect, useRef } from 'react';
import { Stack } from 'react-bootstrap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Store details
 */
const STORE_LOCATION = {
    name: "Stilnovo Warehouse",
    street: "Paseo de la Estación, 100",
    city: "28933 Móstoles, Madrid",
    country: "Spain",
    latitude: 40.1920,
    longitude: -3.8660
};

/**
 * Custom blue-themed Leaflet map component
 */
export default function StoreLocationMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize map
        map.current = L.map(mapContainer.current, {
            center: [STORE_LOCATION.latitude, STORE_LOCATION.longitude],
            zoom: 15,
            zoomControl: true,
            attributionControl: true
        });

        // Add custom blue-themed tile layer (CartoDB Positron)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map.current);

        // Apply CSS filter to make it more blue-themed
        const mapCanvas = mapContainer.current.querySelector('.leaflet-container');
        if (mapCanvas) {
            (mapCanvas as HTMLElement).style.filter = 'hue-rotate(200deg) saturate(1.2) brightness(0.95)';
        }

        // Custom blue marker icon
        const customIcon = L.divIcon({
            html: `
                <div style="
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    border: 3px solid white;
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
                    font-size: 24px;
                    color: white;
                ">
                    📦
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24]
        });

        // Add marker with popup
        const marker = L.marker(
            [STORE_LOCATION.latitude, STORE_LOCATION.longitude],
            { icon: customIcon }
        ).addTo(map.current);

        // Create popup content
        const popupContent = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                min-width: 220px;
                border-radius: 12px;
                overflow: hidden;
            ">
                <div style="
                    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    color: white;
                    padding: 12px;
                    margin: 0;
                ">
                    <h5 style="margin: 0; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                        📦
                        <span>${STORE_LOCATION.name}</span>
                    </h5>
                </div>
                <div style="padding: 12px; background: white; color: #333;">
                    <p style="margin: 8px 0; font-size: 13px; color: #333; font-weight: 600;">
                        ${STORE_LOCATION.street}
                    </p>
                    <p style="margin: 4px 0; font-size: 12px; color: #666;">
                        ${STORE_LOCATION.city}
                    </p>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 280,
            className: 'stilnovo-popup'
        });

        // Open popup by default
        marker.openPopup();

        return () => {
            // Cleanup on component unmount
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return (
        <Stack gap={2}>
            <div
                ref={mapContainer}
                className="rounded-3"
                style={{
                    width: '100%',
                    height: '220px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(0, 123, 255, 0.2)'
                }}
            />
            <div className="px-3 py-2 rounded-3" style={{ background: 'rgba(0, 123, 255, 0.08)', border: '1px solid rgba(0, 123, 255, 0.2)' }}>
                <h6 className="fw-bold text-primary mb-2" style={{ fontSize: '0.95rem' }}>
                    <i className="fa-solid fa-warehouse me-2"></i>
                    {STORE_LOCATION.name}
                </h6>
                <Stack gap={1} className="ms-0">
                    <p className="mb-0 small text-white-70">
                        <i className="fa-solid fa-road text-primary me-2" style={{ width: '14px' }}></i>
                        {STORE_LOCATION.street}
                    </p>
                    <p className="mb-0 small text-white-70">
                        <i className="fa-solid fa-city text-primary me-2" style={{ width: '14px' }}></i>
                        {STORE_LOCATION.city}
                    </p>
                </Stack>
            </div>
        </Stack>
    );
}
