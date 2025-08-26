"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Shield, Users, Code, Database, Globe, Moon, Sun, Plus } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const LeafletMap = dynamic(() => import("../components/LeafletMap"), { ssr: false });

type FormState = { category: string; description: string; location: string };

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ category: "", description: "", location: "" });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append("category", form.category);
    data.append("description", form.description);
    data.append("location", form.location);
    if (file) data.append("file", file);

    await fetch("/api/report", {
      method: "POST",
      body: data,
    });

    setOpen(false);
    setForm({ category: "", description: "", location: "" });
    setFile(null);
  };

  return (
    <div className={darkMode ? "dark bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-800"}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <h1 className="text-5xl font-bold mb-4 flex justify-center items-center gap-2">
            <Shield className="w-10 h-10 text-blue-600" /> OpenSafetyMap
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-6">
            Crowdsourced, open-source safety incident map. A community-driven platform to
            report, view, and track safety-related issues on an interactive map.
          </p>
          <Button size="lg">Get Started</Button>
        </motion.div>
      </section>

      {/* Interactive Map Preview */}
      <section className="relative py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">🗺️ Interactive Map Preview</h2>
        <div className="h-96 rounded-2xl overflow-hidden shadow-lg">
          <LeafletMap darkMode={darkMode} />
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
            <Card key={i} className="shadow-sm">
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
      <section className="py-16 px-8 bg-gray-100 dark:bg-gray-900">
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
            <Card key={i}>
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">{phase.title}</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {phase.items.map((item, j) => (
                    <li key={j}>{item}</li>
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

      {/* Floating Report Button */}
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Report Incident Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Incident</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="category" value={form.category} onChange={handleChange} placeholder="Category (e.g., Crime, Hazard, Outage)" />
            <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
            <Input type="file" onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] ?? null)} />
            <DialogFooter className="mt-4">
              <Button type="submit">Submit</Button>
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
