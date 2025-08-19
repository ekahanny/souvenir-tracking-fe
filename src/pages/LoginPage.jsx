import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import backgroundPhoto from "../assets/bgblue.jpg";
import { useRef, useState } from "react";
import UserService from "../services/UserService";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import logo2 from "../assets/logo2.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleLogin = async () => {
    if (!username || !password) {
      showError("Username dan Password harus diisi!");
      return;
    }

    try {
      const userData = { username, password };
      const response = await UserService.userLogin(userData);

      if (response && response.accessToken) {
        sessionStorage.setItem("token", response.accessToken);
        showSuccess("Login berhasil!");
        navigate("/");
      } else {
        throw new Error("Token tidak diterima dari server");
      }
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token");

      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          setUsername("");
          setPassword("");
          showError("Username atau password salah");
        } else {
          showError("Terjadi kesalahan pada server");
        }
      } else {
        showError("Login gagal. Silakan coba lagi.");
      }
    }
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
      className="min-h-screen flex flex-col items-center justify-center p-3"
      style={{
        backgroundImage: `url(${backgroundPhoto})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Toast ref={toast} />

      <div className="w-full max-w-md text-center mb-4 mt-5">
        {/* <h1 className="text-white text-3xl md:text-4xl font-bold">
          Welcome Back!👋🏻
        </h1> */}
        <img src={logo2} />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-blue-500 bg-opacity-85 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <label htmlFor="username" className="block text-white mb-2">
              Username
            </label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg"
              placeholder="Masukkan Username"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="w-full">
            <label htmlFor="password" className="block text-white mb-2">
              Password
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputClassName="w-full px-4 py-3 text-black"
              className="w-full [&>div]:w-full"
              toggleMask
              placeholder="Masukkan Password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              feedback={false}
            />
          </div>

          <Button
            label="Login"
            className="py-3 mt-2 bg-white text-blue-600 font-semibold hover:bg-gray-100"
            onClick={handleLogin}
          />
          {/* 
          <p className="text-white mt-3 text-center">
            Belum punya akun?{" "}
            <span
              className="cursor-pointer font-bold underline"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p> */}
        </div>
      </div>

      {/* Footer and Additional Links */}
      <p className="text-white text-sm pb-3">
        &copy; 2025 Eka Hanny (Magang PUR TW II 2025)
      </p>
    </div>
  );
}
