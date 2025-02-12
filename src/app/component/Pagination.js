import React, { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function HeaderMenu({ currentTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { name: "Vendor-Contact", label: "Vendor", href: "/Vendor" },
    { name: "kpi-testimonials", label: "KPI Testimonials", href: "/" },
    { name: "Vendor-Long-List", label: "VendorLongList", href: "/Vendorlonglist" }
  ];

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">MyApp</div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={24} />
        </button>
        <div className="hidden md:flex space-x-4">
          {tabs.map((tab, index) => (
            <Link key={index} href={tab.href} className={`px-4 py-2 text-lg font-medium rounded ${
                currentTab === tab.name
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col space-y-2">
          {tabs.map((tab, index) => (
            <Link key={index} href={tab.href} className={`block px-4 py-2 text-lg font-medium rounded ${
                currentTab === tab.name
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}>
              {tab.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
