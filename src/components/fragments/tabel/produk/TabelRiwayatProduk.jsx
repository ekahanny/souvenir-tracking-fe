import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import KegiatanService from "../../../../services/KegiatanService";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";

export default function TabelRiwayatProduk() {
  const [kegiatan, setKegiatan] = useState([]);
  const navigate = useNavigate();
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    pic: "",
    tanggal: null,
  });
  const toast = useRef(null);

  // Filter configuration
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const fetchkegiatan = async () => {
    try {
      const response = await KegiatanService.getKegiatan();
      const kegiatans = response.kegiatan || [];

      const formattedKegiatan = kegiatans.map((keg) => {
        const logDate =
          keg.logs.length > 0 ? keg.logs[0].tanggal : keg.createdAt;
        const totalStokKeluar = keg.logs.reduce(
          (total, log) => total + log.stok,
          0
        );

        return {
          _id: keg._id,
          nama_kegiatan: keg.nama_kegiatan,
          pic: keg.pic,
          tanggal: logDate,
          totalProduk: keg.produk.length,
          totalStokKeluar: totalStokKeluar,
        };
      });
      // Filter hanya kegiatan dengan stok keluar > 0
      // .filter((keg) => keg.totalStokKeluar > 0);

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
    setFilters({
      ...filters,
      global: { value: value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const showDetailKegiatan = (rowData) => {
    navigate(`/riwayat-kegiatan/${rowData._id}`);
  };

  const showEditDialog = (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setFormData({
      nama_kegiatan: kegiatan.nama_kegiatan,
      pic: kegiatan.pic,
      tanggal: new Date(kegiatan.tanggal),
    });
    setEditDialogVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!formData.nama_kegiatan || !formData.pic || !formData.tanggal) {
      toast.current.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Semua field harus diisi",
        life: 3000,
      });
      return;
    }

    try {
      // setLoading(true);

      // Update kegiatan data
      // await KegiatanService.updateKegiatan(selectedKegiatan._id, {
      //   nama_kegiatan: formData.nama_kegiatan,
      //   pic: formData.pic,
      // });

      await KegiatanService.updateKegiatan(
        selectedKegiatan._id,
        formData.tanggal
      );

      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Data kegiatan berhasil diperbarui",
        life: 3000,
      });

      setEditDialogVisible(false);
      fetchkegiatan();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail:
          error.response?.data?.message || "Gagal memperbarui data kegiatan",
        life: 3000,
      });
      console.error("Error updating kegiatan:", error);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex justify-center">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          size="small"
          className="mr-2 bg-green-300"
          onClick={() => showEditDialog(rowData)}
        />
        <Button
          icon="pi pi-clipboard"
          rounded
          outlined
          size="small"
          className="bg-sky-400 mr-2"
          onClick={() => showDetailKegiatan(rowData)}
        />
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

  const editDialogFooter = (
    <div>
      <Button
        label="Batal"
        icon="pi pi-times"
        onClick={() => setEditDialogVisible(false)}
        className="px-2 py-1.5 border-1 border-slate-400 text-sm text-slate-700 mr-2"
      />
      <Button
        label="Simpan"
        icon="pi pi-check"
        onClick={handleEditSubmit}
        className="px-2.5 py-1.5 text-sm border-1 border-sky-400 text-white bg-sky-400"
      />
    </div>
  );

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
      <Toast ref={toast} />

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
          globalFilterFields={["nama_kegiatan", "pic"]}
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

      <Dialog
        visible={editDialogVisible}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Edit Kegiatan"
        modal
        className="p-fluid"
        footer={editDialogFooter}
        onHide={() => setEditDialogVisible(false)}
      >
        <div className="field">
          <label htmlFor="nama_kegiatan" className="font-bold">
            Nama Kegiatan
          </label>
          <InputText
            id="nama_kegiatan"
            value={formData.nama_kegiatan}
            onChange={(e) =>
              setFormData({ ...formData, nama_kegiatan: e.target.value })
            }
            className="border border-slate-400 rounded-md p-2"
          />
        </div>

        <div className="field">
          <label htmlFor="pic" className="font-bold">
            PIC
          </label>
          <InputText
            id="pic"
            value={formData.pic}
            onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
            className="border border-slate-400 rounded-md p-2 "
          />
        </div>

        <div className="field">
          <label htmlFor="tanggal_kegiatan" className="font-bold">
            Tanggal Kegiatan
          </label>
          <Calendar
            id="tanggal_kegiatan"
            inputClassName="border border-slate-400 rounded-md p-2 bg-gray-100"
            className="bg-gray-100 rounded-md"
            readOnlyInput
            showIcon
            dateFormat="dd-mm-yy"
          />
        </div>
      </Dialog>
    </div>
  );
}
