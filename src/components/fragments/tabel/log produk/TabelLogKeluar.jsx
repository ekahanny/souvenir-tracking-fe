import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import CategoryService from "../../../../services/CategoryService";
import InLogProdService from "../../../../services/InLogProdService";
import ProductService from "../../../../services/ProductService";
import * as XLSX from "xlsx";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import KegiatanService from "../../../../services/KegiatanService";

export default function TabelLogKeluar() {
  let emptyProduct = {
    nama_produk: "",
    tanggal: "",
    kategori: "",
    stok: 0,
    isProdukMasuk: false,
    nama_kegiatan: "",
    pic: "",
  };

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [productList, setProductList] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteLogProductDialog, setDeleteLogProductDialog] = useState(false);
  const [kegiatan, setKegiatan] = useState([]);
  const [showNewActivityFields, setShowNewActivityFields] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const toast = useRef(null);
  const dt = useRef(null);

  const fetchLogProducts = async () => {
    try {
      const response = await InLogProdService.getAllLogProducts();
      const productList =
        response.LogProduk.filter((item) => item.isProdukMasuk === false) || [];

      const products = productList.map((item) => {
        return {
          _id: item._id,
          nama_produk: item.produk ? item.produk.nama_produk : "N/A",
          kategori: item.produk ? item.produk.kategori : "Unknown",
          tanggal: item.tanggal,
          stok: item.stok,
          kegiatan: item.kegiatan?._id || null,
          pic: item.pic || "",
          createdBy: item.createdBy,
        };
      });

      setProducts(products);
    } catch (error) {
      console.error("Gagal mengambil log produk:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await ProductService.getAllProducts();
      const products = response.data || [];
      const productInStock = products.filter((p) => p.stok > 0);
      setProductList(productInStock);
    } catch (error) {
      console.error("Gagal mengambil produk: ", error);
    } finally {
      setIsLoadingProducts(false);
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

  const fetchkegiatan = async () => {
    try {
      const response = await KegiatanService.getKegiatan();
      const kegiatanData = response.kegiatan || [];
      const formattedKegiatan = kegiatanData.map((item) => ({
        id: item._id,
        nama_kegiatan: item.nama_kegiatan || "Unknown",
        pic: item.pic || "",
        tanggal: item.tanggal || item.createdAt,
      }));
      setKegiatan(formattedKegiatan);
    } catch (error) {
      console.error("Gagal mengambil kegiatan:", error);
      setKegiatan([]);
    }
  };

  useEffect(() => {
    fetchLogProducts();
    fetchCategories();
    fetchProducts();
    fetchkegiatan();
  }, []);

  const openNew = () => {
    fetchProducts();
    setProduct({ ...emptyProduct });
    setSubmitted(false);
    setIsEditMode(false);
    setProductDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setShowNewActivityFields(false);
    setProductDialog(false);
  };

  const hideDeleteLogProductDialog = () => {
    setDeleteLogProductDialog(false);
  };

  const getFirstInDate = async (namaProduk) => {
    try {
      const response = await InLogProdService.getAllLogProducts();
      const productLogs = response.LogProduk || [];

      const inLogs = productLogs.filter(
        (log) =>
          log.produk?.nama_produk === namaProduk && log.isProdukMasuk === true
      );
      if (inLogs.length === 0) return null;

      inLogs.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      return new Date(inLogs[0].tanggal);
    } catch (error) {
      console.error("Gagal mengambil log produk:", error);
      return null;
    }
  };

  const saveProduct = async () => {
    setSubmitted(true);

    if (!product.nama_produk || !product.stok) {
      toast.current.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Nama produk dan stok harus diisi!",
        life: 3000,
      });
      return;
    }

    try {
      const formattedDate = new Date(product.tanggal);
      formattedDate.setHours(formattedDate.getHours() + 8);

      if (isEditMode) {
        // Data untuk edit - hanya update yang diperbolehkan
        const productData = {
          nama_produk: product.nama_produk,
          stok: product.stok,
          tanggal: formattedDate.toISOString(),
        };

        await InLogProdService.updateLogProduct(product._id, productData);
      } else {
        // Data untuk tambah baru
        const productData = {
          nama_produk: product.nama_produk,
          stok: product.stok,
          tanggal: formattedDate.toISOString(),
          nama_kegiatan: product.nama_kegiatan,
          pic: product.pic,
          isProdukMasuk: false,
        };

        // Validasi stok
        const selectedProduct = productList.find(
          (p) => p.nama_produk === product.nama_produk
        );

        if (selectedProduct && product.stok > selectedProduct.stok) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: `Stok keluar melebihi stok yang tersedia (${selectedProduct.stok})`,
            life: 3000,
          });
          return;
        }

        const firstInDate = await getFirstInDate(product.nama_produk);
        const outDate = new Date(product.tanggal);

        if (firstInDate && outDate < firstInDate) {
          const formattedFirstInDate = firstInDate.toLocaleDateString("id-ID");
          toast.current.show({
            severity: "warn",
            summary: "Peringatan",
            detail: `Tanggal keluar tidak boleh lebih awal dari tanggal masuk pertama (${formattedFirstInDate})`,
            life: 5000,
          });
          return;
        }

        await InLogProdService.addLogProduct(productData);

        // Update stok produk
        setProductList((prevList) =>
          prevList.map((item) =>
            item.nama_produk === product.nama_produk
              ? { ...item, stok: item.stok - product.stok }
              : item
          )
        );
      }

      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: `Produk berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}`,
        life: 3000,
      });

      setProductDialog(false);
      setProduct(emptyProduct);
      fetchLogProducts();
      fetchkegiatan();
    } catch (error) {
      console.error(
        isEditMode ? "Gagal mengupdate produk:" : "Gagal menambahkan produk:",
        error.response?.data || error.message
      );

      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail:
          error.response?.data?.message ||
          (isEditMode ? "Gagal mengupdate produk" : "Gagal menambahkan produk"),
        life: 3000,
      });
    } finally {
      setSubmitted(false);
    }
  };

  const editProduct = (product) => {
    setProduct({
      ...product,
      tanggal: product.tanggal ? new Date(product.tanggal) : new Date(),
      stok: product.stok,
    });

    setIsEditMode(true);
    setProductDialog(true);
  };

  const confirmDeleteLogProduct = (product) => {
    setProduct(product);
    setDeleteLogProductDialog(true);
  };

  const deleteLogProduct = async () => {
    try {
      await InLogProdService.deleteLogProduct(product._id);
      setProducts((prevProducts) =>
        prevProducts.filter((val) => val._id !== product._id)
      );

      setDeleteLogProductDialog(false);
      setProduct(emptyProduct);
      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Produk berhasil dihapus",
        life: 3000,
      });
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal menghapus produk",
        life: 3000,
      });
    }
  };

  const handleConfirmExport = () => {
    setExportDialog(false);

    if (!products || products.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Tidak ada data untuk diekspor",
        life: 3000,
      });
      return;
    }

    const excelData = products.map((product) => ({
      "Nama Barang": product.nama_produk || "",
      Kategori:
        categories.find((cat) => cat.id === product.kategori)?.name ||
        product.kategori ||
        "",
      "Tanggal Keluar": product.tanggal ? formatDate(product.tanggal) : "",
      "Stok (pcs)": product.stok ? product.stok : 0,
      "Nama Kegiatan": product.nama_kegiatan || "",
      PIC: product.pic || "",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Keluar");
    XLSX.writeFile(wb, "Data_Barang_Keluar.xlsx");
  };

  const exportExcel = () => {
    setExportDialog(true);
  };

  const onProductNameChange = (e) => {
    const selectedName = e.value;
    const selectedProduct = productList.find(
      (p) => p.nama_produk === selectedName
    );

    setProduct((prev) => ({
      ...prev,
      nama_produk: selectedName,
      kategori: selectedProduct?.kategori || "",
    }));
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: val,
    }));
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: val,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const kegiatanBodyTemplate = (rowData) => {
    const kegiatanItem = kegiatan.find((k) => k.id === rowData.kegiatan);
    return kegiatanItem ? kegiatanItem.nama_kegiatan : "Unknown";
  };

  const categoryBodyTemplate = (rowData) => {
    const category = categories.find((cat) => cat.id === rowData.kategori);
    return category ? category.name : "Unknown";
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
          onClick={() => editProduct(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          className="bg-red-300"
          onClick={() => confirmDeleteLogProduct(rowData)}
          size="small"
        />
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Tambah"
          icon="pi pi-plus"
          onClick={openNew}
          className="bg-sky-600 text-white px-3 py-2"
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <Button
        label="Export"
        icon="pi pi-upload"
        onClick={exportExcel}
        className="bg-sky-600 text-white px-3 py-2"
      />
    );
  };

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    "products.nama_produk": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    representative: { value: null, matchMode: FilterMatchMode.IN },
    status: {
      operator: FilterOperator.OR,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });

  const onGlobalFilterChange = (event) => {
    const value = event.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
  };

  const renderHeader = () => {
    const value = filters["global"] ? filters["global"].value : "";
    return (
      <div className="flex flex-wrap gap-2 align-items-center justify-content-between bg-slate-100 border border-slate-200">
        <h4 className="ml-4 my-3 text-2xl text-sky-700">Barang Keluar</h4>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            value={value || ""}
            onInput={(e) => onGlobalFilterChange(e)}
            placeholder="Search..."
            className="mr-3 pl-5 pr-2 py-2 border border-slate-300"
          />
        </IconField>
      </div>
    );
  };

  const header = renderHeader();

  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Batal"
        icon="pi pi-times"
        style={{ fontSize: "0.5rem" }}
        className="px-2 py-1.5 border-1 border-sky-400 text-sm text-sky-400 mr-2"
        onClick={hideDialog}
      />
      <Button
        label={isEditMode ? "Update" : "Simpan"}
        icon="pi pi-check"
        style={{ fontSize: "0.5rem" }}
        className="px-2.5 py-1.5 text-sm border-1 border-sky-400 text-white bg-sky-400"
        onClick={saveProduct}
      />
    </React.Fragment>
  );

  const deleteLogProductDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideDeleteLogProductDialog}
        className="px-2 py-1.5 border-1 border-sky-400 text-sm text-sky-400 mr-2"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteLogProduct}
        className="px-2.5 py-1.5 text-sm border-1 border-red-400 text-white bg-red-400"
      />
    </React.Fragment>
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="card ml-1 my-3 rounded-lg shadow-lg ">
        <Toolbar
          className="mb-4"
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
        ></Toolbar>

        <DataTable
          ref={dt}
          value={products}
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
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
          onFilter={(e) => setFilters(e.filters)}
          header={header}
          tableClassName="border border-slate-300"
          tableStyle={{ maxWidth: "100%" }}
          emptyMessage="Tidak ada data ditemukan."
        >
          <Column
            field="nama_produk"
            header="Nama Barang"
            sortable
            style={{ minWidth: "16rem" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          ></Column>
          <Column
            field="kategori"
            header="Kategori"
            body={categoryBodyTemplate}
            style={{ minWidth: "8rem" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          ></Column>
          <Column
            field="tanggal"
            header="Tanggal Keluar"
            body={(rowData) => formatDate(rowData.tanggal)}
            sortable
            style={{ minWidth: "10rem" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          ></Column>
          <Column
            field="stok"
            header="Jumlah Barang"
            sortable
            style={{ minWidth: "8rem" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          ></Column>
          <Column
            field="kegiatan"
            header="Nama Kegiatan"
            body={kegiatanBodyTemplate}
            style={{ minWidth: "12rem" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
            sortable
          />
          <Column
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "5rem" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          ></Column>
        </DataTable>
      </div>

      {/* Product Dialog */}
      <Dialog
        visible={productDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header={isEditMode ? "Edit Barang Keluar" : "Tambah Barang Keluar"}
        modal
        className="p-fluid"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        {isEditMode ? (
          <>
            <div className="field">
              <label htmlFor="nama_kegiatan" className="font-bold">
                Nama Kegiatan
              </label>
              <InputText
                id="nama_kegiatan"
                value={product.nama_kegiatan}
                readOnly
                disabled
                className="border border-slate-400 rounded-md p-2 bg-gray-100"
              />
            </div>

            <div className="field">
              <label htmlFor="pic" className="font-bold">
                PIC (Penanggung Jawab)
              </label>
              <InputText
                id="pic"
                value={product.pic}
                readOnly
                disabled
                className="border border-slate-400 rounded-md p-2 bg-gray-100"
              />
            </div>

            <div className="field">
              <label htmlFor="tanggal_kegiatan" className="font-bold">
                Tanggal Keluar
              </label>
              <Calendar
                id="tanggal_kegiatan"
                inputClassName="border border-slate-400 rounded-md p-2"
                className="bg-sky-300 rounded-md"
                value={product.tanggal}
                onChange={(e) => setProduct({ ...product, tanggal: e.value })}
                showIcon
                dateFormat="dd-mm-yy"
              />
            </div>
          </>
        ) : (
          <>
            {!showNewActivityFields ? (
              <div className="field">
                <label htmlFor="nama_kegiatan" className="font-bold">
                  Nama Kegiatan
                </label>
                <div className="flex gap-2">
                  <Dropdown
                    id="nama_kegiatan"
                    value={product.nama_kegiatan}
                    onChange={(e) => {
                      const selectedKegiatan = kegiatan.find(
                        (k) => k.nama_kegiatan === e.value
                      );
                      setProduct({
                        ...product,
                        nama_kegiatan: e.value,
                        pic: selectedKegiatan?.pic || "",
                        tanggal: selectedKegiatan?.tanggal || new Date(),
                      });
                    }}
                    options={kegiatan.map((activity) => ({
                      label: activity.nama_kegiatan || "Kegiatan Tanpa Nama",
                      value: activity.nama_kegiatan || "",
                    }))}
                    placeholder={
                      kegiatan.length === 0
                        ? "Tidak ada kegiatan"
                        : "Pilih Kegiatan"
                    }
                    className={classNames("border border-slate-400 w-full", {
                      "p-invalid border-red-500":
                        submitted && !product.nama_kegiatan,
                    })}
                  />
                </div>
                {submitted && !product.nama_kegiatan && (
                  <small className="p-error">Nama kegiatan harus diisi</small>
                )}

                <Button
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm px-2.5 py-1.5 mt-2.5 text-sm border-1 border-sky-400 text-white bg-sky-400"
                  onClick={() => setShowNewActivityFields(true)}
                  label="Tambah Kegiatan Baru"
                />
              </div>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="new_nama_kegiatan" className="font-bold">
                    Nama Kegiatan Baru
                  </label>
                  <InputText
                    id="new_nama_kegiatan"
                    value={product.nama_kegiatan}
                    onChange={(e) => onInputChange(e, "nama_kegiatan")}
                    className={classNames(
                      "border border-slate-400 rounded-md p-2",
                      {
                        "p-invalid border-red-500":
                          submitted && !product.nama_kegiatan,
                      }
                    )}
                  />
                  {submitted && !product.nama_kegiatan && (
                    <small className="p-error">Nama kegiatan harus diisi</small>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="pic" className="font-bold">
                    PIC (Penanggung Jawab)
                  </label>
                  <InputText
                    id="pic"
                    value={product.pic}
                    onChange={(e) => onInputChange(e, "pic")}
                    className={classNames(
                      "border border-slate-400 rounded-md p-2",
                      {
                        "p-invalid border-red-500": submitted && !product.pic,
                      }
                    )}
                  />
                  {submitted && !product.pic && (
                    <small className="p-error">PIC harus diisi</small>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="tanggal_kegiatan" className="font-bold">
                    Tanggal Kegiatan
                  </label>
                  <Calendar
                    id="tanggal_kegiatan"
                    inputClassName={classNames(
                      "border border-slate-400 rounded-md p-2"
                    )}
                    className="bg-sky-300 rounded-md"
                    value={product.tanggal}
                    onChange={(e) =>
                      setProduct({ ...product, tanggal: e.value })
                    }
                    showIcon
                    dateFormat="dd-mm-yy"
                  />
                </div>
              </>
            )}
          </>
        )}

        <div className="field">
          <label htmlFor="nama_produk" className="font-bold">
            Nama Barang
          </label>
          <Dropdown
            value={product.nama_produk}
            onChange={onProductNameChange}
            options={
              isLoadingProducts
                ? [{ label: "Memuat data...", value: null }]
                : productList?.map((p) => ({
                    label: `${p.nama_produk} (Stok: ${p.stok})`,
                    value: p.nama_produk,
                  }))
            }
            filter
            showClear
            optionLabel="label"
            placeholder={isLoadingProducts ? "Memuat..." : "Pilih Produk..."}
            disabled={isLoadingProducts || isEditMode}
            className={classNames("border border-slate-400 w-full", {
              "p-invalid border-red-500": submitted && !product.nama_produk,
            })}
          />
          {submitted && !product.nama_produk && (
            <small className="p-error">Pilih produk terlebih dahulu</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="stok" className="font-bold">
            Jumlah Barang Keluar
          </label>
          <InputNumber
            id="stok"
            value={product.stok}
            onChange={(e) => onInputNumberChange(e, "stok")}
            inputClassName={classNames(
              "border border-slate-400 p-2 rounded-md",
              {
                "p-invalid border-red-500": submitted && !product.stok,
              }
            )}
          />
          {submitted && !product.stok && (
            <small className="p-error">Jumlah barang keluar harus diisi</small>
          )}
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteLogProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Konfirmasi"
        modal
        footer={deleteLogProductDialogFooter}
        onHide={hideDeleteLogProductDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "1.5rem" }}
          />
          {product && (
            <span>
              Apakah Anda yakin ingin menghapus log produk{" "}
              <b>{product.nama_produk}</b>?
            </span>
          )}
        </div>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        visible={exportDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Konfirmasi Ekspor"
        modal
        footer={
          <React.Fragment>
            <Button
              label="Batal"
              icon="pi pi-times"
              outlined
              onClick={() => setExportDialog(false)}
              className="px-2 py-1.5 border-1 border-slate-400 text-sm text-slate-700 mr-2"
            />
            <Button
              label="Export"
              icon="pi pi-check"
              onClick={handleConfirmExport}
              className="px-2.5 py-1.5 text-sm border-1 border-sky-400 text-white bg-sky-400"
            />
          </React.Fragment>
        }
        onHide={() => setExportDialog(false)}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "1.5rem" }}
          />
          <span>Apakah Anda yakin ingin mengekspor data ke Excel?</span>
        </div>
      </Dialog>
    </div>
  );
}
