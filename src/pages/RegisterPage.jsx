import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import backgroundPhoto from "../assets/bgblue.jpg";
import { useRef, useState } from "react";
import UserService from "../services/UserService";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
    confPassword: "",
  });

  const navigate = useNavigate();
  const toast = useRef(null);

  const handleRegister = async () => {
    const { nama, username, email, password, confPassword } = formData;

    if (!nama || !username || !email || !password || !confPassword) {
      showError("Semua field harus diisi!");
      return;
    }

    if (password !== confPassword) {
      showError("Password dan konfirmasi password tidak cocok!");
      return;
    }

    try {
      const response = await UserService.userRegister(formData);
      showSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Register error:", error);
      if (error.response) {
        if (error.response.status === 400) {
          showError("Username atau email sudah digunakan");
        } else {
          showError("Terjadi kesalahan pada server");
        }
      } else {
        showError("Registrasi gagal. Silakan coba lagi.");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
    });
  };

  const showError = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col align-items-center justify-content-center py-5"
      style={{
        backgroundImage: `url(${backgroundPhoto})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Toast ref={toast} />
      <h1 className="text-white text-5xl font-bold mb-5">Create Account!✍🏻</h1>
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "700px",
          borderRadius: "12px",
          backgroundColor: "#3b82f6",
          boxShadow: "0 8px 10px rgba(0, 0, 0, 0.1)",
          opacity: "0.85",
          padding: "3rem",
        }}
      >
        <div className="flex flex-column align-items-center gap-4 px-3">
          <div className="w-full">
            <label htmlFor="nama" className="block text-white mb-2">
              Nama
            </label>
            <InputText
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              className="w-full p-3 text-black"
              pt={{
                root: { style: { borderRadius: "8px" } },
              }}
              placeholder="Masukkan Nama"
            />
          </div>

          <div className="w-full">
            <label htmlFor="username" className="block text-white mb-2">
              Username
            </label>
            <InputText
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-3 text-black"
              pt={{
                root: { style: { borderRadius: "8px" } },
              }}
              placeholder="Masukkan Username"
            />
          </div>

          <div className="w-full">
            <label htmlFor="email" className="block text-white mb-2">
              Email
            </label>
            <InputText
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 text-black"
              pt={{
                root: { style: { borderRadius: "8px" } },
              }}
              placeholder="Masukkan Email"
            />
          </div>

          <div className="w-full">
            <label htmlFor="password" className="block text-white mb-2">
              Password
            </label>
            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              inputClassName="w-full px-4 py-3 text-black"
              className="w-full [&>div]:w-full"
              toggleMask
              pt={{
                root: { style: { borderRadius: "8px" } },
                input: { style: { width: "100%" } },
              }}
              placeholder="Masukkan Password"
              feedback={false}
            />
          </div>

          <div className="w-full">
            <label htmlFor="confPassword" className="block text-white mb-2">
              Konfirmasi Password
            </label>
            <Password
              id="confPassword"
              name="confPassword"
              value={formData.confPassword}
              onChange={handleInputChange}
              inputClassName="w-full px-4 py-3 text-black"
              className="w-full [&>div]:w-full"
              toggleMask
              pt={{
                root: { style: { borderRadius: "8px" } },
                input: { style: { width: "100%" } },
              }}
              placeholder="Konfirmasi Password"
              feedback={false}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
          </div>

          <Button
            label="Register"
            className="py-2 px-4 mt-2 bg-white text-blue-600 font-semibold"
            raised
            onClick={handleRegister}
          />

          <p className="text-white mt-2">
            Sudah punya akun?{" "}
            <span
              className="cursor-pointer font-bold underline"
              onClick={() => navigate("/login")}
            >
              Login disini
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
