import React, { useRef } from "react";
import { Sidebar } from "primereact/sidebar";
import { NavLink } from "react-router-dom";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

export default function SidebarComponent() {
  const toast = useRef(null);

  const handleLogout = () => {
    confirmDialog({
      message: "Are you sure you want to log out?",
      header: "Logout Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName:
        "px-2.5 py-1.5 text-sm border border-sky-400 text-white bg-sky-400",
      rejectClassName:
        "px-2 py-1.5 border border-sky-400 text-sm text-sky-400 mr-2",
      acceptLabel: "Ya",
      rejectLabel: "Batal",
      accept: () => {
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      },
      reject: () => {
        toast.current.show({
          severity: "info",
          summary: "Cancelled",
          detail: "Logout dibatalkan",
          life: 3000,
        });
      },
    });
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[210px] bg-white border-r z-40">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex flex-col h-full justify-between">
        <div className="overflow-y-auto">
          <ul className="list-none p-3">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded text-black hover:bg-gray-200 w-full ${
                    isActive ? "bg-blue-300" : "bg-white"
                  }`
                }
              >
                <i className="pi pi-home mr-2" />
                <span className="font-medium">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/barang-masuk"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded text-black hover:bg-gray-200 w-full ${
                    isActive ? "bg-blue-300" : "bg-white"
                  }`
                }
              >
                <i className="pi pi-shopping-cart mr-2" />
                <span className="font-medium">Barang Masuk</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/barang-keluar"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded text-black hover:bg-gray-200 w-full ${
                    isActive ? "bg-blue-300" : "bg-white"
                  }`
                }
              >
                <i className="pi pi-shop mr-2" />
                <span className="font-medium">Barang Keluar</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/riwayat-produk"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded text-black hover:bg-gray-200 w-full ${
                    isActive ? "bg-blue-300" : "bg-white"
                  }`
                }
              >
                <i className="pi pi-history mr-2" />
                <span className="font-medium">Riwayat Produk</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/kategori"
                className={({ isActive }) =>
                  `flex items-center p-3 rounded text-black hover:bg-gray-200 w-full ${
                    isActive ? "bg-blue-300" : "bg-white"
                  }`
                }
              >
                <i className="pi pi-box mr-2" />
                <span className="font-medium">Kategori</span>
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="">
          <hr className="mb-3 border-t" />
          <a
            onClick={handleLogout}
            className="flex m-2 align-items-center cursor-pointer p-3 gap-2 border-round text-900 hover:surface-200"
          >
            <i className="pi pi-sign-out ml-5"></i>

            <span className="font-bold">Log Out</span>
          </a>
        </div>
      </div>
    </div>
  );
}
