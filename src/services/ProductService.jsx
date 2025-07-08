import axiosInstance from "../utils/api";

const ProductService = {
  addProduct: async (productData) => {
    try {
      const response = await axiosInstance.post("/produk", productData);
      return response.data;
    } catch (error) {
      console.error("Gagal menambahkan produk:", error);
      throw error;
    }
  },

  getAllProducts: async () => {
    try {
      const response = await axiosInstance.get("/produk");
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil produk: ", error);
      return [];
    }
  },

  getProductById: async (id_produk) => {
    try {
      const response = await axiosInstance.get(`/produk/${id_produk}`);
      return response.data;
    } catch (error) {
      console.error(`Gagal mengambil produk dengan id ${id_produk}: `, error);
      return [];
    }
  },

  updateProduct: async (id_produk, updatedData) => {
    try {
      const response = await axiosInstance.put(
        `/produk/${id_produk}`,
        updatedData
      );
      return response.data;
    } catch (error) {
      console.error("Gagal mengupdate produk:", error);
      return [];
    }
  },

  deleteProduct: async (id_produk) => {
    try {
      const response = await axiosInstance.delete(`/produk/${id_produk}`);
      return response.data;
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      return [];
    }
  },
};

export default ProductService;
