import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KegiatanService from "../services/KegiatanService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import SidebarComponent from "../components/elements/Sidebar";
import { NavBar } from "../components/elements/NavBar";
import { LoadingSpinner } from "../components/elements/LoadingSpinner";

export default function DetailRiwayatKegiatan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kegiatan, setKegiatan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchKegiatanDetail = async () => {
    try {
      setLoading(true);
      const response = await KegiatanService.getKegiatanById(id);

      if (response.success) {
        setKegiatan(response.data);
      } else {
        throw new Error("Gagal mengambil detail kegiatan");
      }
    } catch (error) {
      console.error("Error fetching kegiatan detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatanDetail();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const produkBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.nama_produk}</div>
        {/* <div className="text-sm text-gray-600">
          Stok: {rowData.stok} {rowData.jenis_satuan}
        </div> */}
      </div>
    );
  };

  // const logBodyTemplate = (log) => {
  //   return (
  //     <div className="mb-2 p-2 border-b border-gray-200">
  //       <div className="flex justify-between">
  //         <span className="font-medium">Tanggal:</span>
  //         <span>{formatDate(log.tanggal)}</span>
  //       </div>
  //       <div className="flex justify-between">
  //         <span className="font-medium">Jumlah:</span>
  //         <span
  //           className={log.isProdukMasuk ? "text-green-600" : "text-red-600"}
  //         >
  //           {log.isProdukMasuk ? "+" : "-"}
  //           {log.stok} {log.produk.jenis_satuan}
  //         </span>
  //       </div>
  //     </div>
  //   );
  // };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!kegiatan) {
    return (
      <div className="flex bg-slate-200">
        <SidebarComponent />
        <div className="flex-1 min-h-screen">
          <div className="ml-[210px] p-4">
            <NavBar />
            <div className="bg-white rounded-md shadow-lg p-6 text-center">
              <h2 className="text-xl text-red-500">
                Data kegiatan tidak ditemukan
              </h2>
              <Button
                label="Kembali"
                icon="pi pi-arrow-left"
                className="mt-4 bg-sky-500 hover:bg-sky-600 text-white"
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-200">
      <SidebarComponent />
      <div className="flex-1 min-h-screen">
        <div className="ml-[210px] p-4">
          <NavBar />

          <div className="bg-white rounded-md shadow-lg border border-sky-200 mx-3 mb-3 mt-8 p-6">
            <div className="flex justify-between items-center mb-6">
              <Button
                label="Kembali"
                icon="pi pi-arrow-left"
                className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2"
                onClick={() => navigate(-1)}
              />
              <h1 className="text-3xl text-sky-700 font-bold">
                DETAIL KEGIATAN
              </h1>
              <div></div> {/* Spacer untuk alignment */}
            </div>

            <div className="gap-6 mb-8 flex flex-col">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-sky-700">
                  Informasi Kegiatan
                </h2>
                <div className="space-y-2 text-black text-lg">
                  <div className="flex space-x-2">
                    <span className="font-medium">Nama Kegiatan:</span>
                    <span>{kegiatan.nama_kegiatan}</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="font-medium">PIC:</span>
                    <span>{kegiatan.pic}</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="font-medium">Tanggal Kegiatan:</span>
                    <span>{formatDate(kegiatan.createdAt)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="font-medium">Jumlah Produk:</span>
                    <span>{kegiatan.produk.length} item</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="font-medium">Total Stok Keluar:</span>
                    <span className="text-red-600">
                      {kegiatan.logs.reduce(
                        (total, log) => total + log.stok,
                        0
                      )}{" "}
                      pcs
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-sky-700">
                  Daftar Barang
                </h2>
                <DataTable
                  value={kegiatan.produk}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10]}
                  dataKey="id"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  pt={{
                    paginator: {
                      root: { className: "bg-gray-100 p-2" },
                      pageButton: ({ context }) =>
                        context.active
                          ? { className: "bg-sky-500 text-white font-bold" }
                          : { className: "text-gray-700 hover:bg-gray-200" },
                    },
                  }}
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                  // filters={filters}
                  // header={header}
                  tableClassName="border border-slate-300"
                  tableStyle={{ minWidth: "50rem" }}
                  // onFilter={(e) => setFilters(e.filters)}
                  stateStorage="session"
                  stateKey="dt-state-demo-local"
                  emptyMessage="Tidak ada data ditemukan."
                >
                  <Column
                    header="No"
                    body={(_, { rowIndex }) => rowIndex + 1}
                    style={{ width: "10%" }}
                    className="border border-slate-300"
                    headerClassName="border border-gray-300"
                  />
                  <Column
                    field="nama_produk"
                    header="Barang"
                    body={produkBodyTemplate}
                    style={{ width: "60%" }}
                    className="border border-slate-300"
                    headerClassName="border border-gray-300"
                  />
                  <Column
                    header="Stok Keluar"
                    body={(rowData) => (
                      <span className="text-red-600">
                        {kegiatan.logs
                          .filter((log) => log.produk._id === rowData._id)
                          .reduce((total, log) => total + log.stok, 0)}{" "}
                        {rowData.jenis_satuan}
                      </span>
                    )}
                    style={{ width: "30%" }}
                    className="border border-slate-300"
                    headerClassName="border border-gray-300"
                  />
                </DataTable>
              </div>
            </div>

            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-sky-700">
                Riwayat Transaksi
              </h2>
              <div className="space-y-2">
                {kegiatan.logs.map((log, index) => (
                  <div
                    key={index}
                    className="p-3 border-b border-gray-200 hover:bg-gray-100"
                  >
                    {logBodyTemplate(log)}
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
