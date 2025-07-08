import axiosInstance from "../utils/api";

const UserService = {
  userLogin: async (userData) => {
    try {
      const res = await axiosInstance.post("/login", userData);
      return res.data;
    } catch (error) {
      console.error("Gagal login: ", error);
      throw error.response?.data?.msg || "Gagal login";
    }
  },

  userRegister: async (userData) => {
    try {
      const res = await axiosInstance.post("/register", userData);
      return res.data;
    } catch (error) {
      console.error("Register Gagal: ", error);
      throw error.response?.data?.msg || "Register Gagal";
    }
  },

  getUser: async () => {
    try {
      const res = await axiosInstance.get("/user");
      return res.data;
    } catch (error) {
      console.error("Gagal mengambil data profil: ", error);
      throw error.response?.data?.msg || "Gagal memuat data pengguna";
    }
  },

  getUserById: async (userId) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return null;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const res = await axiosInstance.put("/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      return res.data;
    } catch (error) {
      console.error("Error response:", error.response);
      throw new Error(error.response?.data?.msg || "Gagal mengubah password");
    }
  },

  updateUsername: async (newUsername) => {
    try {
      const res = await axiosInstance.put("/update-username", { newUsername });
      return res.data;
    } catch (error) {
      console.error("Gagal mengubah username: ", error);
      throw error.response?.data?.msg || "Gagal mengubah username";
    }
  },
};

export default UserService;
