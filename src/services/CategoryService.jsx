import axiosInstance from "../utils/api";

const CategoryService = {
  addCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post("/kategori", categoryData);
      return response.data;
    } catch (error) {
      console.error("Gagal menambahkan kategori:", error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await axiosInstance.get("/kategori");
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil data kategori:", error);
      return [];
    }
  },

  updateCategory: async (id_category, categoryData) => {
    try {
      const response = await axiosInstance.put(
        `/kategori/${id_category}`,
        categoryData
      );
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil kategori: ", error);
      return [];
    }
  },
  deleteCategory: async (id_category) => {
    try {
      const response = await axiosInstance.delete(`/kategori/${id_category}`);
      return response.data;
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
      return [];
    }
  },
};

export default CategoryService;
