import { useEffect, useState } from "react";
import { NavBar } from "../components/elements/NavBar";
import SidebarComponent from "../components/elements/Sidebar";
import TabelKategori from "../components/fragments/tabel/kategori/TabelKategori";
import { LoadingSpinner } from "../components/elements/LoadingSpinner";

export function Kategori() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex bg-slate-200">
      <SidebarComponent />
      <div className="flex-1">
        <div className="ml-[210px] mt-[60px] p-4 min-h-screen">
          <NavBar />

          {loading ? <LoadingSpinner /> : <TabelKategori />}
        </div>
      </div>
    </div>
  );
}
