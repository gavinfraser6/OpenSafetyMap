"use client";

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { LeafletMapRef } from "@/types/leaflet-map";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Extend the L object with MarkerClusterGroup
declare module "leaflet" {
  interface Layer {
    cluster?: MarkerClusterGroup;
  }
}

type Report = {
  id: number;
  category: string;
  description: string;
  location: string;
  fileName: string | null;
  timestamp: string;
  latitude: number;
  longitude: number;
};

type Props = {
  onMapClick?: (lat: number, lng: number) => void;
  onLoadReports?: (reports: Report[]) => void;
  defaultLatitude?: number;
  defaultLongitude?: number;
  loadingLocation?: boolean;
  onRefreshReports?: () => void;
};

const LeafletMapComponent = ({ 
  onMapClick, 
  onLoadReports,
  defaultLatitude = -33.9249,
  defaultLongitude = 18.4241,
  loadingLocation = false,
  onRefreshReports
}: Props, ref: React.Ref<LeafletMapRef>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const reportMarkerRef = useRef<L.Marker | null>(null);
  const reportsCacheRef = useRef<Record<string, Report[]>>({});
  const [isClient, setIsClient] = useState(false);
  const initialLocationSetRef = useRef(false);

  // Expose refresh function
  useImperativeHandle(ref, () => ({
    refreshReports: loadReportsInBounds,
    clearCacheForBounds: () => {
      if (mapRef.current) {
        const bounds = mapRef.current.getBounds();
        const boundsKey = `${bounds.getSouth().toFixed(4)}_${bounds.getWest().toFixed(4)}_${bounds.getNorth().toFixed(4)}_${bounds.getEast().toFixed(4)}`;
        delete reportsCacheRef.current[boundsKey];
      }
    }
  }));

  // Load reports when map moves
  const loadReportsInBounds = async () => {
    if (!mapRef.current) return;
    
    try {
      const bounds = mapRef.current.getBounds();
      const boundsKey = `${bounds.getSouth().toFixed(4)}_${bounds.getWest().toFixed(4)}_${bounds.getNorth().toFixed(4)}_${bounds.getEast().toFixed(4)}`;
      
      // Check cache first
      if (reportsCacheRef.current[boundsKey]) {
        renderReports(reportsCacheRef.current[boundsKey]);
        if (onLoadReports) onLoadReports(reportsCacheRef.current[boundsKey]);
        return;
      }
      
      const url = `/api/report?south=${bounds.getSouth()}&west=${bounds.getWest()}&north=${bounds.getNorth()}&east=${bounds.getEast()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.reports) {
        // Cache the results
        reportsCacheRef.current[boundsKey] = data.reports;
        
        renderReports(data.reports);
        if (onLoadReports) onLoadReports(data.reports);
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  };

  // Render reports on the map
  const renderReports = (reports: Report[]) => {
    if (!markersRef.current || !mapRef.current) return;
    
    // Clear existing markers but preserve the report marker
    const reportMarker = reportMarkerRef.current;
    if (reportMarker) {
      // Temporarily remove the report marker
      mapRef.current.removeLayer(reportMarker);
    }
    
    // Clear other markers
    markersRef.current.clearLayers();
    
    // Add new markers
    reports.forEach((report: Report) => {
      const marker = L.marker([report.latitude, report.longitude]);
      marker.bindPopup(`
        <div class="report-popup">
          <h3><strong>${report.category}</strong></h3>
          <p>${report.description}</p>
          <p><small><strong>Location:</strong> ${report.location}</small></p>
          <p><small>${new Date(report.timestamp).toLocaleString()}</small></p>
        </div>
      `);
      markersRef.current?.addLayer(marker);
    });
    
    // Re-add the report marker if it existed
    if (reportMarker) {
      mapRef.current.addLayer(reportMarker);
    }
  };

  // Initialize map once
  useEffect(() => {
    setIsClient(true);
    
    if (!containerRef.current || mapRef.current) return;

    // Initialize with default location
    const map = L.map(containerRef.current, {
      maxZoom: 18,
      minZoom: 3,
      zoomControl: true
    }).setView([defaultLatitude, defaultLongitude], 13);
    mapRef.current = map;

    // Mark that we've set the initial location
    initialLocationSetRef.current = true;

    // Create marker cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
    });
    markersRef.current = markers;
    map.addLayer(markers);

    // Handle map clicks for report submission
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
      
      // Remove existing report marker if it exists
      if (reportMarkerRef.current) {
        map.removeLayer(reportMarkerRef.current);
      }
      
      // Add new marker at clicked location
      const reportMarker = L.marker([e.latlng.lat, e.latlng.lng], {
        draggable: true,
        title: "Report location"
      }).addTo(map);
      
      // Update marker position when dragged
      reportMarker.on('dragend', function(event) {
        const marker = event.target;
        const position = marker.getLatLng();
        if (onMapClick) {
          onMapClick(position.lat, position.lng);
        }
      });
      
      reportMarkerRef.current = reportMarker;
    });

    // Load initial reports
    loadReportsInBounds();

    // Listen for map move events with debounce
    let moveEndTimeout: NodeJS.Timeout;
    map.on('moveend', () => {
      clearTimeout(moveEndTimeout);
      moveEndTimeout = setTimeout(loadReportsInBounds, 500);
    });

    // Add initial layer
    const initialUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const initialLayer = L.tileLayer(initialUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    
    layerRef.current = initialLayer;
    initialLayer.addTo(map);

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        clearTimeout(moveEndTimeout);
        mapRef.current.off('moveend');
        mapRef.current.off('click');
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
        markersRef.current = null;
        if (reportMarkerRef.current) {
          reportMarkerRef.current.remove();
          reportMarkerRef.current = null;
        }
      }
    };
  }, []); // Empty dependency array - only run once

  // Update map view ONLY when initially loading user's location
  useEffect(() => {
    if (mapRef.current && !loadingLocation && !initialLocationSetRef.current) {
      mapRef.current.setView([defaultLatitude, defaultLongitude], 13);
      initialLocationSetRef.current = true;
    }
  }, [defaultLatitude, defaultLongitude, loadingLocation]);

  // Only render the map container on the client
  if (!isClient) {
    return <div ref={containerRef} style={{ height: "100%", width: "100%" }} className="dimmed-map" />;
  }

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} className="dimmed-map" />;
};

const LeafletMap = forwardRef(LeafletMapComponent);
export default LeafletMap;