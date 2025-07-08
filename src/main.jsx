/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard.jsx";
import { BarangMasuk } from "./pages/BarangMasuk.jsx";
import { BarangKeluar } from "./pages/BarangKeluar.jsx";
import { PrimeReactProvider } from "primereact/api";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Kategori } from "./pages/Kategori.jsx";
import RiwayatProduk from "./pages/RiwayatProduk.jsx";
import DetailRiwayatProduk from "./pages/DetailRiwayatProduk.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "../src/components/fragments/auth/ProtectedRoute.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/riwayat-produk",
        element: <RiwayatProduk />,
      },
      {
        path: "/barang-masuk",
        element: <BarangMasuk />,
      },
      {
        path: "/barang-keluar",
        element: <BarangKeluar />,
      },
      {
        path: "/kategori",
        element: <Kategori />,
      },
      {
        path: "/detail-riwayat/:id",
        element: <DetailRiwayatProduk />,
      },
      {
        path: "/profile",
        element: <UserProfile />,
      },
    ],
  },
]);

// Redirect ke login kl tdk terautentikasi
const root = createRoot(document.getElementById("root"));

const App = () => {
  // const isAuthenticated = sessionStorage.getItem("token");
  // const initialPath = isAuthenticated ? "/" : "/login";

  return (
    <StrictMode>
      <PrimeReactProvider>
        <RouterProvider router={router} />
      </PrimeReactProvider>
    </StrictMode>
  );
};

root.render(<App />);
