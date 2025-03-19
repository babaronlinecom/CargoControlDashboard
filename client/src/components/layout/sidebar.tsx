import React from "react";
import { useLocation, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Plug, 
  BarChart,
  Receipt,
  CreditCard
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

function SidebarItem({ icon, label, href, active }: SidebarItemProps) {
  return (
    <li className="px-3">
      <Link href={href}>
        <div 
          className={`w-full flex items-center px-4 py-2 text-sm rounded-md cursor-pointer ${
            active 
              ? "bg-primary text-white" 
              : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={(e) => {
            if (window.innerWidth < 768) {
              // Close sidebar on mobile when clicking a link
              const sidebarElement = document.getElementById("sidebar");
              if (sidebarElement) {
                sidebarElement.classList.add("hidden");
              }
            }
          }}
        >
          <span className="w-5 h-5 mr-3">{icon}</span>
          <span>{label}</span>
        </div>
      </Link>
    </li>
  );
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();

  const sidebarClass = open 
    ? "fixed inset-0 z-40 block md:flex md:w-64 md:static" 
    : "hidden md:flex md:w-64";

  return (
    <div id="sidebar" className={`${sidebarClass} flex-col bg-white border-r border-gray-200 h-full`}>
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-white" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M8 16.5L1.5 10l1.5-1.5L8 14l9-9 1.5 1.5L8 16.5z" />
            </svg>
          </div>
          <h1 className="ml-2 text-xl font-semibold text-gray-800">CargoAdmin</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            href="/" 
            active={location === "/"} 
          />
          <SidebarItem 
            icon={<Package size={18} />} 
            label="Shipments" 
            href="/shipments" 
            active={location === "/shipments"} 
          />
          <SidebarItem 
            icon={<DollarSign size={18} />} 
            label="Rate Management" 
            href="/rate-management" 
            active={location === "/rate-management"} 
          />
          
          {/* Financial Management Section */}
          <li className="mt-6 px-3">
            <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Financial Management
            </h2>
          </li>
          <SidebarItem 
            icon={<Receipt size={18} />} 
            label="Invoices" 
            href="/invoices" 
            active={location === "/invoices"} 
          />
          <SidebarItem 
            icon={<CreditCard size={18} />} 
            label="Payments" 
            href="/payments" 
            active={location === "/payments"} 
          />
          
          {/* Services & Integration Section */}
          <li className="mt-6 px-3">
            <h2 className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Services & Integrations
            </h2>
          </li>
          <SidebarItem 
            icon={<Plug size={18} />} 
            label="API Integrations" 
            href="/api-integrations" 
            active={location === "/api-integrations"} 
          />
          <SidebarItem 
            icon={<BarChart size={18} />} 
            label="Analytics" 
            href="/analytics" 
            active={location === "/analytics"} 
          />
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=Admin" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs font-medium text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
