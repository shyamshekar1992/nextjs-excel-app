import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function HeaderMenu({ currentTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { name: "Vendor-Contact", label: "Vendor", href: "/Vendor" },
    { name: "kpi-testimonials", label: "KPI Testimonials", href: "/" },
    { name: "Vendor-Long-List", label: "Vendor Long List", href: "/Vendorlonglist" },
  ];

  return (
    <nav className="bg-gray-100 p-4 text-gray-900 shadow-md border-b border-gray-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Clickable Logo */}
        <Link href="/" className="flex items-center space-x-4">
          <Image
            src="/logo.png"
            alt="Telescope Advisory Logo"
            width={150}
            height={130}
            className="rounded-md cursor-pointer transition hover:opacity-80"
            priority
          />
        </Link>

        {/* Title (Centered) */}
        <div className="flex-1 text-center">
          <span className="text-lg md:text-lg lg:text-2xl font-semibold tracking-wide text-gray-700 uppercase">
            AI Vendor Radar
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-4 py-2 text-lg font-medium rounded-lg transition ${
                currentTab === tab.name
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-gray-200 mt-2 py-4 rounded-lg shadow-md">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`block px-6 py-3 text-lg font-medium transition ${
                currentTab === tab.name
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-300 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}