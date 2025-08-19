import axiosInstance from "../utils/api";

const KegiatanService = {
  getKegiatan: async () => {
    try {
      const response = await axiosInstance.get("/riwayat-kegiatan");
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil kegiatan:", error);
      return [];
    }
  },

  getKegiatanById: async (id_kegiatan) => {
    try {
      const response = await axiosInstance.get(
        `/detail-kegiatan/${id_kegiatan}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Gagal mengambil kegiatan dengan id ${id_kegiatan}: `,
        error
      );
      return [];
    }
  },

  updateKegiatan: async (id_kegiatan) => {
    try {
      const response = await axiosInstance.put(
        `/riwayat-kegiatan/${id_kegiatan}`
      );
      return response.data;
    } catch (error) {
      console.error("Gagal mengupdate kegiatan:", error);
      return [];
    }
  },
};

export default KegiatanService;
