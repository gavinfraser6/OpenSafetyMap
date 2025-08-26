"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Shield, Users, Code, Database, Globe, Moon, Sun, Plus, X, List } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
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
  const [darkMode, setDarkMode] = useState(false);
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

  const handleMapClick = (lat: number, lng: number) => {
    setForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
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
      latitude: -33.9249,
      longitude: 18.4241
    });
    setFile(null);
  };

  const toggleReportsPanel = () => {
    setShowReportsPanel(!showReportsPanel);
  };

  const handleLoadReports = (loadedReports: Report[]) => {
    setReports(loadedReports);
  };

  return (
    <div className={darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-blue-100 to-white dark:from-gray-800 dark:to-gray-900">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <h1 className="text-5xl font-bold mb-4 flex justify-center items-center gap-2">
            <Shield className="w-10 h-10 text-blue-600" /> OpenSafetyMap
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-6 text-gray-700 dark:text-gray-300">
            Crowdsourced, open-source safety incident map. A community-driven platform to
            report, view, and track safety-related issues on an interactive map.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setOpen(true)}>Get Started</Button>
            <Button size="lg" variant="outline" onClick={toggleReportsPanel}>
              <List className="w-4 h-4 mr-2" />
              {showReportsPanel ? "Hide Reports" : "View Reports"}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Interactive Map with Reports Panel */}
      <section className="relative py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">🗺️ Interactive Safety Map</h2>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Container */}
          <div className="flex-1 h-96 lg:h-[600px] rounded-2xl overflow-hidden shadow-lg relative border-2 border-gray-300 dark:border-gray-700">
            <LeafletMap 
              darkMode={darkMode} 
              onMapClick={handleMapClick} 
              onLoadReports={handleLoadReports} 
            />
            {/* Click Instruction Overlay */}
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-300 dark:border-gray-700">
              Click on map to set report location
            </div>
            {/* Reports Counter */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 px-3 py-2 rounded-lg text-sm shadow-lg border border-gray-300 dark:border-gray-700">
              {reports.length} reports in view
            </div>
            {/* Floating Report Button */}
            <Button
              size="lg"
              onClick={() => setOpen(true)}
              className="absolute bottom-6 right-6 z-[1000] rounded-full p-4 shadow-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Reports Panel */}
          {showReportsPanel && (
            <div className="w-full lg:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-96 lg:h-[600px] overflow-y-auto border-2 border-gray-300 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Recent Reports</h3>
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
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">✨ MVP Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MapPin, title: "Report Incidents", text: "Add category, description & location." },
            { icon: Globe, title: "Interactive Map", text: "View reports, filter by category & date." },
            { icon: Users, title: "Community Verification", text: "Vote & confirm reports." },
            { icon: Code, title: "Media Uploads", text: "Attach photos or files to reports." },
            { icon: Shield, title: "Privacy", text: "Report anonymously or with authentication." },
            { icon: Database, title: "Open Data", text: "All data licensed under CC BY 4.0." },
          ].map((f, i) => (
            <Card key={i} className="shadow-md hover:shadow-lg transition-shadow border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <f.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-8 bg-gray-100 dark:bg-gray-800">
        <h2 className="text-3xl font-bold mb-10 text-center">🚀 Roadmap</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Phase 1 – MVP",
              items: ["User auth (optional for reporting)", "Reports (create, list, view, moderate)", "Map view with markers", "Basic moderation system"],
            },
            {
              title: "Phase 2 – Community Engagement",
              items: ["Voting & verification", "Notifications & nearby alerts", "Heatmaps for high-risk areas", "Categories expansion"],
            },
            {
              title: "Phase 3 – Scaling",
              items: ["City/region support", "Open API for NGOs, journalists, researchers", "Integration with municipal/civic feeds", "Role-based access"],
            },
            {
              title: "Phase 4 – Long-Term",
              items: ["AI duplicate/fake report detection", "WhatsApp/SMS bot reporting", "Offline-first mobile app", "Predictive analytics"],
            },
          ].map((phase, i) => (
            <Card key={i} className="border-2 border-gray-300 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2 text-blue-600">{phase.title}</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-gray-700 dark:text-gray-300">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contributing */}
      <section className="py-16 px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">👫 Contributing</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          We welcome contributions of all kinds: code, translations, data integrations,
          design, and documentation.
        </p>
        <Button variant="outline">View Contribution Guide</Button>
      </section>

      

      {/* Report Incident Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700">
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
              <p className="text-xs mt-1">Click on the map to set the exact location</p>
            </div>
            <Input 
              type="file" 
              onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] ?? null)} 
              className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <DialogFooter className="mt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Submit Report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-6 text-center">
        <p className="mb-2">📜 Code: Apache License 2.0 | Data: CC BY 4.0</p>
        <p className="text-sm">🌍 Empowering communities with open, transparent, and actionable safety information.</p>
      </footer>
    </div>
  );
}
