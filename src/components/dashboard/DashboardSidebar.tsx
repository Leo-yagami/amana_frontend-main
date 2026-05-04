import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  LayoutDashboard,
  Users,
  UsersRound,
  HandHeart,
  Gift,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: UsersRound, label: "Families", href: "/dashboard/families" },
  // { icon: Users, label: "Beneficiaries", href: "/dashboard/beneficiaries" },
  { icon: HandHeart, label: "Donors", href: "/dashboard/donors" },
  { icon: Gift, label: "Donations", href: "/dashboard/donations" },
  { icon: Calendar, label: "Events", href: "/dashboard/events" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // const COLLAPSE_BREAKPOINT = 1050;

  // useEffect(() => {
  //   const media = window.matchMedia(`(max-width: ${COLLAPSE_BREAKPOINT}px)`);

  //   const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
  //     setCollapsed(e.matches);
  //   };

  //   // set initial state
  //   setCollapsed(media.matches);

  //   // listen for changes
  //   media.addEventListener("change", handleChange);

  //   return () => media.removeEventListener("change", handleChange);
  // }, []);

// const COLLAPSE_AT = 1066;
// const MOBILE_BREAKPOINT = 1024;

// useEffect(() => {
//   const handleResize = () => {
//     const width = window.innerWidth;

//     // Mobile mode (hamburger): sidebar should be expanded (not collapsed)
//     if (width < MOBILE_BREAKPOINT) {
//       setCollapsed(false);
//       return;
//     }

//     // Mid range: collapse
//     if (width <= COLLAPSE_AT) {
//       setCollapsed(true);
//       return;
//     }

//     // Desktop: expanded
//     setCollapsed(false);
//   };

//   handleResize();
//   window.addEventListener("resize", handleResize);
//   return () => window.removeEventListener("resize", handleResize);
// }, []);

useEffect(() => {
  const collapseMedia = window.matchMedia("(max-width: 1066px)");
  const mobileMedia = window.matchMedia("(max-width: 1023px)");

  const update = () => {
    if (mobileMedia.matches) {
      setCollapsed(false); // mobile mode: expanded
    } else if (collapseMedia.matches) {
      setCollapsed(true); // mid range: collapsed
    } else {
      setCollapsed(false); // desktop: expanded
    }
  };

  update();

  collapseMedia.addEventListener("change", update);
  mobileMedia.addEventListener("change", update);

  return () => {
    collapseMedia.removeEventListener("change", update);
    mobileMedia.removeEventListener("change", update);
  };
}, []);

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-56 sm:w-60 lg:w-64"
      )}
    >
      {/* Header */}
      {/* <div className="h-14 sm:h-16 lg:h-20 flex items-center justify-between px-3 sm:px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-sm flex-shrink-0">
            <Heart className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          {!collapsed && (
            <span className="text-sm sm:text-base lg:text-lg font-bold text-sidebar-foreground truncate">
              HopeBridge
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          // onClick={() => setCollapsed(!collapsed)}
          onClick={() => {
            if (window.innerWidth > COLLAPSE_BREAKPOINT) {
              setCollapsed((prev) => !prev);
            }
          }}
          className="hidden lg:flex h-10 w-10 flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-10 w-10 absolute right-2 top-1/2 -translate-y-1/2"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div> */}
      {/* Header */}
      <div className="h-14 sm:h-16 lg:h-20 flex items-center px-3 sm:px-4 border-b border-sidebar-border">
        <div className="flex items-center w-full gap-2">
          
          {/* Logo */}
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 min-w-10",
              collapsed && "justify-start w-full"
            )}
          >
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-sm flex-shrink-0">
              <Heart className="w-5 h-5 text-primary-foreground fill-current" />
            </div>

            {!collapsed && (
              <span className="text-sm sm:text-base lg:text-lg font-bold text-sidebar-foreground truncate">
                HopeBridge
              </span>
            )}
          </Link>

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("hidden min-[1060px]:flex h-10 w-10 ml-2 flex-shrink-0",
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 sm:py-6 px-2 sm:px-3 overflow-y-auto">
        <ul className="space-y-0.5 sm:space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 min-h-10",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 sm:p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 w-full text-sm sm:text-base min-h-10"
          title={collapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
          {!collapsed && <span className="truncate">Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
