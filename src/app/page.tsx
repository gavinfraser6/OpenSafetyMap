"use client";

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Shield, Plus, X, List, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const LeafletMap = dynamic(() => import("../components/LeafletMap"), { ssr: false });

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

type FormState = { 
  category: string; 
  description: string; 
  location: string;
  latitude: number;
  longitude: number;
};

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [showReportsPanel, setShowReportsPanel] = useState(false);
  const [form, setForm] = useState<FormState>({ 
    category: "", 
    description: "", 
    location: "",
    latitude: -33.9249,
    longitude: 18.4241
  });
  const [file, setFile] = useState<File | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [locationSelected, setLocationSelected] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setForm(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLoadingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      setLoadingLocation(false);
    }
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setLocationSelected(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append("category", form.category);
    data.append("description", form.description);
    data.append("location", form.location);
    data.append("latitude", form.latitude.toString());
    data.append("longitude", form.longitude.toString());
    if (file) data.append("file", file);

    await fetch("/api/report", {
      method: "POST",
      body: data,
    });

    setOpen(false);
    setForm({ 
      category: "", 
      description: "", 
      location: "",
      latitude: form.latitude, // Keep current location as default
      longitude: form.longitude
    });
    setLocationSelected(false);
    setFile(null);
  };

  const toggleReportsPanel = () => {
    setShowReportsPanel(!showReportsPanel);
  };

  const handleLoadReports = (loadedReports: Report[]) => {
    setReports(loadedReports);
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Top Bar with Icons */}
      <div className="absolute top-0 left-0 right-0 z-[1001] flex justify-between items-center p-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold">OpenSafetyMap</h1>
        </div>
        
        {/* Icons */}
        <div className="flex gap-2">
          <Link href="/about">
            <Button variant="outline" size="icon" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Info className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={toggleReportsPanel} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Map Container - Full Screen */}
      <div className="absolute inset-0">
        <LeafletMap 
          onMapClick={handleMapClick} 
          onLoadReports={handleLoadReports} 
          defaultLatitude={form.latitude}
          defaultLongitude={form.longitude}
          loadingLocation={loadingLocation}
        />
      </div>

      {/* Floating Report Button */}
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        className="absolute bottom-6 right-6 z-[1000] rounded-full p-4 shadow-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Reports Counter */}
      <div className="absolute top-20 right-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-300 dark:border-gray-700 backdrop-blur-sm z-[1001] text-gray-900 dark:text-gray-100">
        {reports.length} reports in view
      </div>

      {/* Click Instruction Overlay */}
      <div className="absolute top-20 left-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-300 dark:border-gray-700 backdrop-blur-sm z-[1001] text-gray-900 dark:text-gray-100">
        Click on map to set report location
      </div>

      {/* Reports Panel */}
      {showReportsPanel && (
        <div className="absolute top-16 right-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-[calc(100vh-100px)] overflow-y-auto border-2 border-gray-300 dark:border-gray-700 z-[1001]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Recent Reports</h3>
            <Button variant="ghost" size="icon" onClick={toggleReportsPanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">No reports in current view</p>
                <p className="text-gray-400 text-sm mt-1">Pan or zoom to load reports</p>
              </div>
            ) : (
              [...reports].reverse().map(report => (
                <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between">
                    <span className="font-medium">{report.category}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-gray-800 dark:text-gray-200">{report.description}</p>
                  <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">{report.location}</p>
                  <div className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 z-[1002]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Report an Incident</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Incident Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Crime", 
                  "Hazard", 
                  "Outage", 
                  "Protest", 
                  "Accident", 
                  "Other"
                ].map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={form.category === category ? "default" : "outline"}
                    onClick={() => setForm({...form, category})}
                    className="text-sm py-2"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <Input 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                placeholder="Or specify a custom category" 
                className="mt-2 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <Textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Description" 
              required
              className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Input 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              placeholder="Location details" 
              className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-3 rounded border border-gray-300 dark:border-gray-600">
              <p className="font-medium">Map Coordinates</p>
              <p>Latitude: {form.latitude.toFixed(6)}</p>
              <p>Longitude: {form.longitude.toFixed(6)}</p>
              {!locationSelected && (
                <p className="text-xs mt-1 text-red-500">Please click on the map to select a location</p>
              )}
              {locationSelected && (
                <p className="text-xs mt-1 text-green-500">Location selected - ready to submit</p>
              )}
            </div>
            <Input 
              type="file" 
              onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] ?? null)} 
              className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <DialogFooter className="mt-4">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!locationSelected}
              >
                {locationSelected ? "Submit Report" : "Select Location First"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}