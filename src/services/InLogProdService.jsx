import axiosInstance from "../utils/api";

const InLogProdService = {
  addLogProduct: async (productData) => {
    try {
      const response = await axiosInstance.post("/produk/log", productData);
      return response.data;
    } catch (error) {
      console.error("Gagal menambahkan log produk:", error);
      throw error;
    }
  },

  getAllLogProducts: async () => {
    try {
      const response = await axiosInstance.get("/produk/log");
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil log produk:", error);
      return [];
    }
  },

  getLogProductById: async (id_produk) => {
    try {
      const response = await axiosInstance.get(`/produk/log/${id_produk}`);
      return response.data;
    } catch (error) {
      console.error(`Gagal mengambil produk dengan id ${id_produk}: `, error);
      return [];
    }
  },

  updateLogProduct: async (id_produk, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/produk/log/${id_produk}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error("Gagal mengupdate log produk:", error);
      return [];
    }
  },

  deleteLogProduct: async (id_produk) => {
    try {
      const response = await axiosInstance.delete(`/produk/log/${id_produk}`);
      return response.data;
    } catch (error) {
      console.error("Gagal menghapus log produk:", error);
      return [];
    }
  },
};

export default InLogProdService;
