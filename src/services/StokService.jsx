import axiosInstance from "../utils/api";

const StokService = {
  getStokByProdukId: async (produtId) => {
    try {
      const res = await axiosInstance.get(`stok/produk/${produtId}`);
      return res.data;
    } catch (error) {
      console.error("Gagal mengambil data stok:", error);
      return [];
    }
  },
};
export default StokService;
