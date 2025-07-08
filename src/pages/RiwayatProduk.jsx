import { useEffect, useState } from "react";
import { NavBar } from "../components/elements/NavBar";
import SidebarComponent from "../components/elements/Sidebar";
import TabelRiwayatProduk from "../components/fragments/tabel/produk/TabelRiwayatProduk";
import { LoadingSpinner } from "../components/elements/LoadingSpinner";

export default function RiwayatProduk() {
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

          {loading ? <LoadingSpinner /> : <TabelRiwayatProduk />}
        </div>
      </div>
    </div>
  );
}
