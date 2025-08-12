import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import KegiatanService from "../../../../services/KegiatanService";

export default function TabelRiwayatProduk() {
  const [kegiatan, setKegiatan] = useState([]);
  const navigate = useNavigate();

  // Filter configuration
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nama_kegiatan: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    tanggal: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
  });

  const fetchkegiatan = async () => {
    try {
      const response = await KegiatanService.getKegiatan();
      const kegiatans = response.kegiatan || [];

      const formattedKegiatan = kegiatans.map((keg) => {
        const logDate =
          keg.logs.length > 0 ? keg.logs[0].tanggal : keg.createdAt;

        return {
          _id: keg._id,
          nama_kegiatan: keg.nama_kegiatan,
          pic: keg.pic,
          tanggal: logDate,
          totalProduk: keg.produk.length,
          totalStokKeluar: keg.logs.reduce((total, log) => total + log.stok, 0),
        };
      });

      setKegiatan(formattedKegiatan);
    } catch (error) {
      console.error("Gagal mengambil kegiatan:", error);
    }
  };

  useEffect(() => {
    fetchkegiatan();
  }, []);

  const onGlobalFilterChange = (event) => {
    const value = event.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
  };

  const showDetailKegiatan = (rowData) => {
    navigate(`/riwayat-kegiatan/${rowData._id}`);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex justify-center">
        <Button
          rounded
          size="small"
          className="bg-sky-400 hover:bg-sky-500 text-white text-sm px-3 py-2"
          onClick={() => showDetailKegiatan(rowData)}
        >
          Show Detail
        </Button>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const produkBodyTemplate = (rowData) => {
    return <div>{rowData.totalProduk} Produk</div>;
  };

  const stokBodyTemplate = (rowData) => {
    return <div>{rowData.totalStokKeluar} pcs</div>;
  };

  const renderHeader = () => {
    const value = filters["global"] ? filters["global"].value : "";

    return (
      <div className="flex flex-wrap gap-2 align-items-center justify-content-between bg-slate-100 border border-slate-200">
        <h4 className="ml-4 my-3 text-2xl text-sky-700">Riwayat Kegiatan</h4>
        <IconField iconPosition="left" className="border border-slate-400 w-96">
          <InputIcon className="pi pi-search ml-2" />
          <InputText
            type="search"
            value={value || ""}
            onChange={(e) => onGlobalFilterChange(e)}
            placeholder="Search"
            className="p-inputtext-sm w-full mr-3 pl-6 pr-2 py-1.5 border border-slate-300"
          />
        </IconField>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div>
      <div className="card ml-1 mt-3 rounded-lg shadow-lg">
        <DataTable
          value={kegiatan}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
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
          filters={filters}
          header={header}
          tableClassName="border border-slate-300"
          tableStyle={{ minWidth: "50rem" }}
          onFilter={(e) => setFilters(e.filters)}
          stateStorage="session"
          stateKey="dt-state-demo-local"
          emptyMessage="Tidak ada data ditemukan."
        >
          <Column
            field="nama_kegiatan"
            header="Nama Kegiatan"
            // sortable
            style={{ width: "25%" }}
            className="border border-slate-300"
            headerClassName="border border-gray-300"
          />
          <Column
            field="pic"
            header="PIC"
            // sortable
            style={{ width: "15%" }}
            className="border border-slate-300"
            headerClassName="border border-gray-300"
          />
          {/* <Column
            header="Jumlah Produk"
            body={produkBodyTemplate}
            style={{ width: "15%" }}
            className="border border-slate-300"
            headerClassName="border border-gray-300"
          />
          <Column
            header="Total Stok Keluar"
            body={stokBodyTemplate}
            style={{ width: "15%" }}
            className="border border-slate-300"
            headerClassName="border border-gray-300"
          /> */}
          <Column
            field="tanggal"
            header="Tanggal Kegiatan"
            body={(rowData) => formatDate(rowData.tanggal)}
            style={{ width: "15%" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
            sortable
          />
          <Column
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ width: "15%" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          />
        </DataTable>
      </div>
    </div>
  );
}
