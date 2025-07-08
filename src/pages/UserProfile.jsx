import { useState, useEffect, useRef } from "react";
import { NavBar } from "../components/elements/NavBar";
import SidebarComponent from "../components/elements/Sidebar";
import { Toast } from "primereact/toast";
import UserService from "../services/UserService";
import { Password } from "primereact/password";

export default function UserProfile() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editType, setEditType] = useState(null);
  const [formData, setFormData] = useState({
    currentUsername: "",
    newUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await UserService.getUser();
        setUserData(response.user);
        setFormData((prev) => ({
          ...prev,
          currentUsername: response.user.username,
        }));
      } catch (error) {
        showToast(
          "error",
          "Error",
          error.message || "Gagal memuat data pengguna"
        );
      }
    };

    fetchUserData();
  }, []);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEdit = (type) => {
    setEditType(type);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditType(null);
    setFormData({
      currentUsername: userData.username,
      newUsername: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const validatePasswordChange = () => {
    if (!formData.currentPassword) {
      throw new Error("Password saat ini harus diisi");
    }
    if (!formData.newPassword || !formData.confirmPassword) {
      throw new Error("Password baru dan konfirmasi harus diisi");
    }
    if (formData.newPassword !== formData.confirmPassword) {
      throw new Error("Password baru dan konfirmasi tidak cocok");
    }
    if (formData.newPassword.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editType === "username") {
        await UserService.updateUsername(formData.newUsername);
        setUserData((prev) => ({ ...prev, username: formData.newUsername }));
        showToast("success", "Success", "Username berhasil diubah");
      } else if (editType === "password") {
        validatePasswordChange();

        const payload = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        };

        console.log("Sending password update:", payload);
        await UserService.updatePassword(payload);
        showToast("success", "Success", "Password berhasil diubah");
      }

      setEditMode(false);
      setEditType(null);
    } catch (error) {
      console.error("Update error:", error);
      showToast("error", "Error", error.message || "Gagal mengubah data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-200">
      <Toast ref={toast} />
      <SidebarComponent />
      <div className="flex-1">
        <div className="ml-[125px] mt-[20px] p-4 min-h-screen">
          <NavBar />
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl">
              <h1 className="text-2xl font-bold mb-6 text-black text-center">
                Profil Pengguna
              </h1>

              {!editMode ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="text-black font-bold">Username</p>
                      <p className="font-medium text-black">
                        {userData.username}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit("username")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                      <div>
                        <p className="text-black font-bold">Password</p>
                        <p className="font-medium text-black">••••••••</p>
                      </div>
                      <button
                        onClick={() => handleEdit("password")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="text-black font-bold">Email</p>
                      <p className="font-medium text-black">{userData.email}</p>
                    </div>
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
                    >
                      Email tidak bisa diubah
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {editType === "username" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-black mb-2">
                          Username Saat Ini
                        </label>
                        <input
                          type="text"
                          name="currentUsername"
                          value={formData.currentUsername}
                          disabled
                          className="w-full p-2 border rounded-md bg-gray-100"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-black mb-2">
                          Username Baru
                        </label>
                        <input
                          type="text"
                          name="newUsername"
                          value={formData.newUsername}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border rounded-md text-black"
                        />
                      </div>
                    </>
                  )}

                  {editType === "password" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-black mb-2">
                          Password Saat Ini
                        </label>
                        <Password
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength="6"
                          inputClassName="w-full border border-black px-3 py-2 text-black"
                          className="w-full [&>div]:w-full"
                          toggleMask
                          feedback={false}
                        />
                      </div>
                      <div>
                        <label className="block text-black mb-2">
                          Password Baru
                        </label>
                        <Password
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength="6"
                          inputClassName="w-full border border-black px-3 py-2 text-black"
                          className="w-full [&>div]:w-full"
                          toggleMask
                          feedback={false}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-black mb-2">
                          Konfirmasi Password Baru
                        </label>
                        <Password
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength="6"
                          inputClassName="w-full border border-black px-3 py-2 text-black"
                          className="w-full [&>div]:w-full"
                          toggleMask
                          feedback={false}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
