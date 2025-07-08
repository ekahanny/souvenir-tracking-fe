/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { NavBar } from "../components/elements/NavBar";
import { PieChart } from "../components/elements/PieChart";
import SidebarComponent from "../components/elements/Sidebar";
import TabelRingkasanProduk from "../components/fragments/tabel/produk/TabelRingkasanProduk";
import InLogProdService from "../services/InLogProdService";
import { Bar } from "react-chartjs-2";
import CategoryService from "../services/CategoryService";
import { ProgressSpinner } from "primereact/progressspinner";
import { LoadingSpinner } from "../components/elements/LoadingSpinner";

export function Dashboard() {
  const [logProduct, setLogProduct] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pemasukan, setPemasukan] = useState(0);
  const [pengeluaran, setPengeluaran] = useState(0);
  const [profit, setProfit] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [logResponse, categoryResponse] = await Promise.all([
          InLogProdService.getAllLogProducts(),
          CategoryService.getCategories(),
        ]);

        setTimeout(() => {
          setLogProduct(logResponse.LogProduk || []);
          setCategories(categoryResponse.KategoriProduk || []);

          // Proses data setelah semua data siap
          hitungKeuangan(logResponse.LogProduk || []);
          processBarChartData(logResponse.LogProduk || []);
          processPieChartData(
            logResponse.LogProduk || [],
            categoryResponse.KategoriProduk || []
          );
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Untuk memproses data ketika logProduct atau categories berubah
  useEffect(() => {
    if (logProduct.length > 0 && categories.length > 0) {
      processPieChartData(logProduct, categories);
    }
  }, [logProduct, categories]);

  const [dataPie, setDataPie] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Barang Terjual",
        data: [],
        backgroundColor: [
          "#447ecc",
          "#5898d9",
          "#78b3e2",
          "#a3cfed",
          "#c9e1f4",
        ],
      },
    ],
  });

  const hitungKeuangan = (logProduk) => {
    const now = new Date();
    const monthName = now.toLocaleString("id-ID", { month: "long" });
    setCurrentMonth(monthName);

    const currentYear = now.getFullYear();

    // Filter log produk untuk bulan ini
    const logsBulanIni = logProduk.filter((log) => {
      if (!log.tanggal) return false;
      const logDate = new Date(log.tanggal);
      return (
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === currentYear
      );
    });

    // Hitung pemasukan (produk keluar)
    const totalPemasukan = logsBulanIni
      .filter((log) => log.isProdukMasuk === false)
      .reduce((total, log) => total + log.harga * log.stok, 0);

    // Hitung pengeluaran (produk masuk)
    const totalPengeluaran = logsBulanIni
      .filter((log) => log.isProdukMasuk === true)
      .reduce((total, log) => total + log.harga * log.stok, 0);

    setPemasukan(totalPemasukan);
    setPengeluaran(totalPengeluaran);
    setProfit(totalPemasukan - totalPengeluaran);
  };

  const [dataBar, setDataBar] = useState({
    labels: [],
    datasets: [
      {
        label: "Barang Masuk",
        backgroundColor: "#5898d9",
        data: [],
      },
      {
        label: "Barang Keluar",
        backgroundColor: "#a3ceed",
        data: [],
      },
    ],
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const processBarChartData = (logProduk) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyData = {};
    const months = [];

    // Inisialisasi data untuk 12 bulan terakhir
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i, 1);
      const monthKey = date.toLocaleString("id-ID", { month: "short" });
      const fullMonthKey = `${monthKey}`;
      months.push(fullMonthKey);
      monthlyData[fullMonthKey] = {
        barangMasuk: 0,
        barangKeluar: 0,
      };
    }

    // Proses setiap log produk
    logProduk.forEach((log) => {
      if (!log.tanggal) return;

      const logDate = new Date(log.tanggal);
      if (logDate.getFullYear() !== currentYear) return;

      const monthKey = logDate.toLocaleString("id-ID", { month: "short" });
      const fullMonthKey = `${monthKey}`;

      if (monthlyData[fullMonthKey]) {
        if (log.isProdukMasuk) {
          monthlyData[fullMonthKey].barangMasuk += log.stok;
        } else {
          monthlyData[fullMonthKey].barangKeluar += log.stok;
        }
      }
    });

    // Siapkan data untuk chart
    const masukArray = months.map((month) => monthlyData[month].barangMasuk);
    const keluarArray = months.map((month) => monthlyData[month].barangKeluar);

    // Hitung max value untuk skala y
    const maxData = Math.max(...masukArray, ...keluarArray);
    const maxY = maxData + 15;

    setDataBar({
      labels: months,
      datasets: [
        {
          label: "Barang Masuk",
          backgroundColor: "#5898d9",
          data: masukArray,
        },
        {
          label: "Barang Keluar",
          backgroundColor: "#a3ceed",
          data: keluarArray,
        },
      ],
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: maxY,
          },
        },
      },
    });
  };

  const processPieChartData = (logProduk) => {
    if (!categories || categories.length === 0) return;

    const categorySales = {};

    logProduk.forEach((log) => {
      if (!log.isProdukMasuk && log.produk?.kategori) {
        const categoryId = log.produk.kategori;
        const category = categories.find((cat) => cat._id === categoryId);

        if (category) {
          categorySales[categoryId] = {
            name: category.nama,
            sold: (categorySales[categoryId]?.sold || 0) + log.stok,
          };
        }
      }
    });

    // Konversi ke array dan urutkan
    const categoryArray = Object.values(categorySales);
    const sortedCategories = categoryArray
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Update state dataPie
    setDataPie({
      labels: sortedCategories.map((category) => category.name),
      datasets: [
        {
          label: "Total Barang Terjual",
          data: sortedCategories.map((category) => category.sold),
          backgroundColor: [
            "#447ecc",
            "#5898d9",
            "#78b3e2",
            "#a3cfed",
            "#c9e1f4",
          ],
        },
      ],
    });
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="flex bg-slate-200">
      <SidebarComponent />
      <div className="flex-1">
        <div className="ml-[215px] mt-[60px] py-3 px-5">
          <NavBar />
          <div className="my-2">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Ringkasan Penjualan */}
                <div className="flex flex-row mb-5 ml-24 gap-4">
                  {/* Pemasukan */}
                  <div className="bg-white p-4 mt-3 h-[130px] w-[391px] rounded-md shadow-md overflow-hidden">
                    <div className="flex flex-row gap-2 justify-center items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill=""
                        className="size-6 mt-1 fill-sky-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="font-semibold text-lg text-black mt-1">
                        Pemasukan:
                      </p>
                      <p className="text-sky-800 text-md mt-1">
                        {currentMonth} {new Date().getFullYear()}
                      </p>
                    </div>
                    <p className="flex items-center justify-center mt-3 mb-2 font-semibold text-xl text-black">
                      {formatRupiah(pemasukan)}
                    </p>
                  </div>

                  {/* Pengeluaran */}
                  <div className="bg-white p-4 mt-3 h-[130px] w-[391px] rounded-md shadow-md overflow-hidden">
                    <div className="flex flex-row gap-2 justify-center items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-6 mt-1 fill-sky-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H18v8.75A2.75 2.75 0 0 1 15.25 15h-1.072l.798 3.06a.75.75 0 0 1-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 0 1-1.452-.38L5.823 15H4.75A2.75 2.75 0 0 1 2 12.25V3.5h-.25A.75.75 0 0 1 1 2.75ZM7.373 15l-.391 1.5h6.037l-.392-1.5H7.373Zm7.49-8.931a.75.75 0 0 1-.175 1.046 19.326 19.326 0 0 0-3.398 3.098.75.75 0 0 1-1.097.04L8.5 8.561l-2.22 2.22A.75.75 0 1 1 5.22 9.72l2.75-2.75a.75.75 0 0 1 1.06 0l1.664 1.663a20.786 20.786 0 0 1 3.122-2.74.75.75 0 0 1 1.046.176Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="font-semibold text-lg text-black mt-1">
                        Pengeluaran:
                      </p>
                      <p className="text-sky-800 text-md mt-1">
                        {currentMonth} {new Date().getFullYear()}
                      </p>
                    </div>
                    <p className="flex items-center justify-center mt-3 mb-2 font-semibold text-xl text-black">
                      {formatRupiah(pengeluaran)}
                    </p>
                  </div>

                  {/* Profit */}
                  <div className="bg-white p-4 mt-3 h-[130px] w-[391px] rounded-md shadow-md overflow-hidden">
                    <div className="flex flex-row gap-2 justify-center items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="white"
                        className="size-7 mt-1 fill-sky-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v7.5m2.25-6.466a9.016 9.016 0 0 0-3.461-.203c-.536.072-.974.478-1.021 1.017a4.559 4.559 0 0 0-.018.402c0 .464.336.844.775.994l2.95 1.012c.44.15.775.53.775.994 0 .136-.006.27-.018.402-.047.539-.485.945-1.021 1.017a9.077 9.077 0 0 1-3.461-.203M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                      <p className="font-semibold text-lg text-black mt-1">
                        Cashflow:
                      </p>
                      <p className="text-sky-800 text-md mt-1">
                        {currentMonth} {new Date().getFullYear()}
                      </p>
                    </div>
                    <p
                      className={`flex items-center justify-center mt-3 mb-2 font-semibold text-xl ${
                        profit < 0 ? "text-red-500" : "text-black"
                      } `}
                    >
                      {formatRupiah(profit)}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="flex flex-row justify-center ml-2 gap-4">
                  {/* Bar Chart */}
                  <div className="md:w-[850px] sm:w-[500px] bg-white px-10 py-3 rounded-md shadow-lg">
                    <h1 className="mt-3 text-center font-semibold text-black">
                      Jumlah Barang Masuk & Barang Keluar Per Bulan
                    </h1>
                    <h1 className=" mt-1 mb-3 text-center font-bold text-xl text-black">
                      ({new Date().getFullYear()})
                    </h1>
                    <Bar data={dataBar} options={dataBar.options} />
                  </div>

                  {/* Pie Chart */}
                  <div className="md:w-[350px] bg-white p-4 py-2 rounded-md shadow-lg">
                    <h1 className="my-3 text-center font-semibold text-black">
                      Barang Terlaris
                    </h1>
                    <PieChart chartData={dataPie} />
                    <p className="flex justify-center items-center text-xl mt-6 font-semibold text-black">
                      ({new Date().getFullYear()})
                    </p>
                  </div>
                </div>

                <div className="ml-2 px-5">
                  <TabelRingkasanProduk />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
