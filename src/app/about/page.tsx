"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Shield, Users, Code, Database, Globe, Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark bg-gray-900 text-gray-100 min-h-screen" : "bg-gray-50 text-gray-900 min-h-screen"}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center py-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex justify-center items-center gap-2">
              <Shield className="w-10 h-10 text-blue-600" /> OpenSafetyMap
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-6 text-gray-700 dark:text-gray-300">
              Crowdsourced, open-source safety incident map. A community-driven platform to
              report, view, and track safety-related issues on an interactive map.
            </p>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-12">
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
        <section className="py-12">
          <h2 className="text-3xl font-bold mb-10 text-center">🚀 Roadmap</h2>
          <div className="grid md:grid-cols-2 gap-6">
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
        <section className="py-12 text-center">
          <h2 className="text-3xl font-bold mb-6">👫 Contributing</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            We welcome contributions of all kinds: code, translations, data integrations,
            design, and documentation.
          </p>
          <p className="mb-6 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            By contributing, you agree that:
            <br />• Code → Licensed under Apache 2.0
            <br />• Data → Licensed under CC BY 4.0
          </p>
          <Button variant="outline" className="mb-8">View Contribution Guide</Button>
          
          <div className="border-t border-gray-300 dark:border-gray-700 pt-8 mt-8">
            <h3 className="text-xl font-bold mb-4">🛠️ Tech Stack</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "React (Next.js)",
                "Leaflet / Mapbox",
                "Node.js (Express/NestJS) or Python (Django/FastAPI)",
                "PostgreSQL + PostGIS",
                "OpenStreetMap tiles",
                "Docker + Fly.io / Railway"
              ].map((tech, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full text-sm">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 px-6 text-center">
        <p className="mb-2">📜 Code: Apache License 2.0 | Data: CC BY 4.0</p>
        <p className="text-sm">🌍 Empowering communities with open, transparent, and actionable safety information.</p>
      </footer>
    </div>
  );
}