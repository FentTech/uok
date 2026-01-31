import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SetupContacts from "./pages/SetupContacts";
import Dashboard from "./pages/Dashboard";
import ManageContacts from "./pages/ManageContacts";
import WellnessInsights from "./pages/WellnessInsights";
import SharedMemories from "./pages/SharedMemories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup-contacts" element={<SetupContacts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manage-contacts" element={<ManageContacts />} />
          <Route path="/wellness-insights" element={<WellnessInsights />} />
          <Route path="/shared-memories" element={<SharedMemories />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
