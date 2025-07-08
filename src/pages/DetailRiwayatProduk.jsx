/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProductService from "../services/ProductService";
import InLogProdService from "../services/InLogProdService";
import SidebarComponent from "../components/elements/Sidebar";
import { NavBar } from "../components/elements/NavBar";
import CategoryService from "../services/CategoryService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useReactToPrint } from "react-to-print";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { LoadingSpinner } from "../components/elements/LoadingSpinner";
import { TabView, TabPanel } from "primereact/tabview";
import { classNames } from "primereact/utils";
import StokService from "../services/StokService";

export default function DetailRiwayatProduk() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [logProduct, setLogProduct] = useState([]);
  const [categories, setCategories] = useState([]);
  const componentRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [productStok, setProductStok] = useState([]);

  const fetchDetailProduct = async () => {
    try {
      const response = await ProductService.getProductById(id);
      if (response._id) {
        setProduct(response);
      } else if (response.Produk) {
        setProduct(response.Produk);
      } else {
        throw new Error("Struktur response tidak dikenali");
      }
      console.log("Product data:", response);
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
    }
  };

  const fetchLogProduct = async () => {
    try {
      const response = await InLogProdService.getAllLogProducts();

      const filteredLogs = response.LogProduk.filter(
        (log) => log.produk?._id === id
      );
      setLogProduct(filteredLogs);
      console.log("Response API Log Produk: ", filteredLogs);
    } catch (error) {
      console.error("Gagal mengambil log produk: ", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getCategories();
      const kategoriArray = response.KategoriProduk || [];
      const formattedCategories = kategoriArray.map((item) => ({
        name: item.nama,
        id: item._id,
      }));
      setCategories(formattedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStokProdById = async (productId) => {
    try {
      const res = await StokService.getStokByProdukId(productId);
      setProductStok(res.data || res);
      console.log("Stok: ", res);
    } catch (error) {
      console.error("Error fetching stock data: ", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchDetailProduct(),
          fetchLogProduct(),
          fetchCategories(),
          fetchStokProdById(id),
        ]);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    fetchData();
  }, [id]);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const getSeverity = (stok) => {
    switch (true) {
      case stok <= 10:
        return "danger";
      case stok <= 50:
        return "warning";
      default:
        return "success";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="flex bg-slate-200">
      <SidebarComponent />
      <div className="flex-1 min-h-screen">
        <div className="ml-[210px] p-4">
          <NavBar />

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="flex justify-between items-center mt-7 mb-4 ml-4">
                <Button
                  label="Kembali"
                  icon="pi pi-angle-double-left"
                  className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2"
                  onClick={() => navigate(-1)}
                />
              </div>

              <div
                ref={componentRef}
                className="bg-white rounded-md shadow-lg border border-sky-200 mb-3 mx-3"
              >
                {product && (
                  <div className="p-6">
                    <h1 className="text-3xl text-sky-700 font-bold text-center mt-3 mb-4">
                      DETAIL RIWAYAT PRODUK
                    </h1>

                    <div className="gap-6 mb-5 text-black text-lg ml-5">
                      <div className="mt-5">
                        <span className="font-medium">Kode Produk:</span>{" "}
                        {product.kode_produk}
                      </div>
                      <div>
                        <span className="font-medium">Nama Produk:</span>{" "}
                        {product.nama_produk}
                      </div>
                      <div>
                        <span className="font-medium">Kategori:</span>{" "}
                        {getCategoryName(product.kategori)}
                      </div>
                      <div>
                        <span className="font-medium">
                          Total Jumlah Produk:
                        </span>{" "}
                        {product.stok}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        {(() => {
                          const severity = getSeverity(product?.stok || 0);
                          const statusConfig = {
                            danger: {
                              text: "Stok Kurang",
                              color: "bg-red-500",
                            },
                            warning: {
                              text: "Stok Menipis",
                              color: "bg-yellow-500",
                            },
                            success: {
                              text: "Stok Aman",
                              color: "bg-green-500",
                            },
                          };

                          const config = statusConfig[severity];

                          return (
                            <>
                              <div
                                className={`p-2 rounded-full ${config.color} animate-pulse`}
                              ></div>
                              <span> {config.text}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <TabView
                      activeIndex={activeIndex}
                      onTabChange={(e) => setActiveIndex(e.index)}
                      className="custom-tabview"
                    >
                      {/* Tab 1 - Detail Produk */}
                      <TabPanel
                        header="Detail Produk"
                        leftIcon="pi pi-history mr-2"
                      >
                        <div className="center-table-wrapper overflow-x-auto mx-4">
                          <DataTable
                            value={logProduct}
                            sortField="tanggal"
                            sortOrder={1}
                            tableStyle={{ minWidth: "100%" }}
                            headerStyle={{ textAlign: "center" }}
                            showFooter
                            autoLayout
                            className="text-sm mt-5"
                            footerColumnGroup={
                              <ColumnGroup>
                                <Row>
                                  <Column
                                    footer="Total Transaksi"
                                    colSpan={4}
                                    footerClassName="font-bold border border-slate-400"
                                  />
                                  <Column
                                    footer={logProduct
                                      .reduce((total, log) => {
                                        const harga =
                                          log.harga !== undefined
                                            ? log.harga
                                            : product.harga;
                                        const amount = harga * log.stok;
                                        return (
                                          total +
                                          (log.isProdukMasuk ? -amount : amount)
                                        );
                                      }, 0)
                                      .toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                      })}
                                    footerClassName="font-bold border border-slate-400 text-center"
                                  />
                                </Row>
                              </ColumnGroup>
                            }
                          >
                            <Column
                              header="No."
                              body={(_, { rowIndex }) => rowIndex + 1}
                              className="border border-slate-400 text-center"
                              headerClassName="border border-slate-400 bg-slate-200 !text-center"
                              headerStyle={{ textAlign: "center" }}
                            />
                            <Column
                              field="tanggal"
                              header="Tanggal"
                              body={(rowData) => formatDate(rowData.tanggal)}
                              className="border border-slate-400 text-center"
                              headerClassName="border border-slate-400 bg-slate-200 !text-center"
                              headerStyle={{ textAlign: "center" }}
                            />
                            <Column
                              field="isProdukMasuk"
                              header="Jenis"
                              body={(rowData) =>
                                rowData.isProdukMasuk
                                  ? "Barang Masuk"
                                  : "Barang Keluar"
                              }
                              className="border border-slate-400 text-center"
                              headerClassName="border border-slate-400 bg-slate-200 !text-center"
                              headerStyle={{ textAlign: "center" }}
                            />
                            <Column
                              field="stok"
                              header="Jumlah"
                              body={(rowData) => (
                                <span
                                  className={
                                    rowData.isProdukMasuk
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {rowData.isProdukMasuk ? "+" : "-"}
                                  {rowData.stok}
                                </span>
                              )}
                              className="border border-slate-400 text-center"
                              headerClassName="border border-slate-400 bg-slate-200 !text-center"
                              headerStyle={{ textAlign: "center" }}
                            />
                            <Column
                              field="stok"
                              header="Riwayat Transaksi"
                              body={(rowData) => {
                                const hargaTransaksi = rowData.harga;
                                const harga =
                                  hargaTransaksi !== undefined
                                    ? hargaTransaksi
                                    : product.harga;

                                const total = harga * rowData.stok;
                                const isIncome = !rowData.isProdukMasuk;

                                return (
                                  <span
                                    className={
                                      isIncome
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {isIncome ? "+" : "-"}
                                    {total.toLocaleString("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                    })}
                                  </span>
                                );
                              }}
                              className="border border-slate-400 text-center"
                              headerClassName="border border-slate-400 bg-slate-200 !text-center"
                              headerStyle={{ textAlign: "center" }}
                            />
                          </DataTable>
                        </div>
                      </TabPanel>

                      <TabPanel
                        header="Tanggal Kadaluarsa"
                        leftIcon="pi pi-info-circle mr-2"
                      >
                        <div className="mt-4 text-center">
                          {productStok.length > 0 ? (
                            <DataTable
                              value={productStok.filter(
                                (item) => item.stok > 0
                              )}
                              className="p-datatable-sm text-center"
                              stripedRows
                              showGridlines
                              tableStyle={{ minWidth: "100%" }}
                              headerStyle={{ textAlign: "center" }}
                              autoLayout
                            >
                              <Column
                                field="stok"
                                header="Jumlah Stok"
                                body={(data) => `${data.stok} pcs`}
                                style={{ width: "20%" }}
                                className="border border-slate-400 text-center"
                                headerClassName="border border-slate-400 bg-slate-200"
                                align="center"
                              />
                              <Column
                                field="tanggalKadaluarsa"
                                header="Tanggal Kedaluwarsa"
                                body={(data) =>
                                  data.tanggalKadaluarsa
                                    ? new Date(
                                        data.tanggalKadaluarsa
                                      ).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      })
                                    : "Tidak ada data"
                                }
                                style={{ width: "30%" }}
                                className="border border-slate-400 text-center"
                                headerClassName="border border-slate-400 bg-slate-200"
                                align="center"
                              />
                            </DataTable>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              Tidak ada data stok tersedia
                            </div>
                          )}
                        </div>
                      </TabPanel>
                    </TabView>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
