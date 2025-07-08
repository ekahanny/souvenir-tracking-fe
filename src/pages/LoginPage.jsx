import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import backgroundPhoto from "../assets/bgblue.jpg";
import { useRef, useState } from "react";
import UserService from "../services/UserService";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";

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
      console.log("login response: ", response);

      if (response && response.accessToken) {
        // Validasi token ada dan tidak undefined
        sessionStorage.setItem("token", response.accessToken);
        showSuccess("Login berhasil!");
        navigate("/");
      } else {
        throw new Error("Token tidak diterima dari server");
      }
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token"); // Bersihkan token jika ada

      // Penanganan error spesifik
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
      className="min-h-screen flex flex-col align-items-center justify-content-center"
      style={{
        backgroundImage: `url(${backgroundPhoto})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Toast ref={toast} />
      <h1 className="text-white text-5xl font-bold mb-5">Welcome Back!👋🏻 </h1>
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: "12px",
          backgroundColor: "#3b82f6",
          boxShadow: "0 8px 10px rgba(0, 0, 0, 0.1)",
          opacity: "0.85",
          padding: "2rem",
        }}
      >
        <div className="flex flex-column align-items-center gap-4 px-3">
          <div className="w-full">
            <label htmlFor="username" className="block text-white mb-2">
              Username
            </label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3"
              pt={{
                root: { style: { borderRadius: "8px" } },
              }}
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
              pt={{
                root: { style: { borderRadius: "8px" } },
                input: { style: { width: "100%" } },
              }}
              placeholder="Masukkan Password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              feedback={false}
            />
          </div>

          <p className="text-white mt-2">
            Belum punya akun?{" "}
            <span
              className="cursor-pointer font-bold underline"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>

          <Button
            label="Login"
            className="py-2 px-4 mt-2 bg-white text-blue-600 font-semibold"
            raised
            onClick={handleLogin}
            // loading={loading}
            // disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
