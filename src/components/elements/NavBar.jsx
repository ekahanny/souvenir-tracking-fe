import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import logo from "../../assets/logo.png";
import { classNames } from "primereact/utils";
import { confirmDialog } from "primereact/confirmdialog";

export function NavBar() {
  const items = [];

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

  const profileItems = [
    {
      label: "Profile",
      icon: "pi pi-user",
      classNames: "w-4",
      command: () => (window.location.href = "/profile"),
    },
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => handleLogout(),
    },
  ];

  const start = (
    <div className="flex items-center h-10">
      <img src={logo} alt="Logo" className="w-14 ml-4" />
      <span className="font-semibold text-xl text-black ml-2">
        Cokonuri Mart
      </span>
    </div>
  );

  return (
    <div className="fixed top-0 left-[210px] right-0 z-50 h-16 bg-white border-b flex items-center px-4 shadow-sm">
      <Menubar
        model={items}
        start={start}
        end={
          <div className="flex items-center gap-2 ml-2">
            <Menubar
              model={[
                {
                  label: "",
                  icon: "pi pi-user",
                  items: profileItems,
                },
              ]}
            />
          </div>
        }
        className="w-full h-full border-none shadow-none"
      />
    </div>
  );
}
