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

export default function TabelLogMasuk() {
  let emptyProduct = {
    nama_produk: "",
    tanggal: "",
    kategori: "",
    stok: 0,
    isProdukMasuk: true,
  };

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [productList, setProductList] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteLogProductDialog, setdeleteLogProductDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProductExist, setIsProductExist] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showNewProductFields, setShowNewProductFields] = useState(false);
  const toast = useRef(null);
  const dt = useRef(null);

  const fetchLogProducts = async () => {
    try {
      const response = await InLogProdService.getAllLogProducts();
      const productList =
        response.LogProduk.filter((item) => item.isProdukMasuk === true) || [];

      const products = productList.map((item) => ({
        _id: item._id,
        nama_produk: item.produk ? item.produk.nama_produk : "N/A",
        kategori: item.produk ? item.produk.kategori : "Unknown",
        tanggal: item.tanggal,
        stok: item.stok,
      }));

      setProducts(products);
    } catch (error) {
      console.error("Gagal mengambil log produk:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getAllProducts();
      setProductList(response.data);
    } catch (error) {
      console.error("Gagal mengambil produk: ", error);
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

  useEffect(() => {
    fetchLogProducts();
    fetchCategories();
    fetchProducts();
  }, []);

  const openNew = () => {
    setProduct({ ...emptyProduct });
    setSubmitted(false);
    setIsEditMode(false);
    setShowNewProductFields(false);
    setIsProductExist(false);
    setProductDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setProductDialog(false);
    setShowNewProductFields(false);
  };

  const hidedeleteLogProductDialog = () => {
    setdeleteLogProductDialog(false);
  };

  const saveProduct = async () => {
    setSubmitted(true);

    if (!product.nama_produk || !product.tanggal || !product.stok) {
      toast.current.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Lengkapi data terlebih dahulu!",
        life: 3000,
      });
      return;
    }

    try {
      const productData = {
        nama_produk: product.nama_produk,
        tanggal: new Date(product.tanggal).toISOString(),
        kategori: product.kategori,
        stok: product.stok,
        isProdukMasuk: true,
      };

      // Cek apakah produk sudah ada
      let currentProduct = productList.find(
        (p) => p.nama_produk === product.nama_produk
      );

      // Jika produk belum ada dan dalam mode tambah produk baru
      if (!currentProduct && showNewProductFields) {
        // Buat produk baru
        const newProduct = await ProductService.addProduct({
          nama_produk: product.nama_produk,
          kategori: product.kategori,
          stok: 0, // Stok awal 0 karena akan ditambah via log
          jenis_satuan: "pcs",
        });
        currentProduct = newProduct.data;
        await fetchProducts(); // Refresh daftar produk
      }

      if (isEditMode) {
        // Mode Edit
        await InLogProdService.updateLogProduct(product._id, productData);
        const originalLog = products.find((p) => p._id === product._id);
        const stokDifference = product.stok - originalLog.stok;

        if (currentProduct) {
          await ProductService.updateProduct(currentProduct._id, {
            ...currentProduct,
            stok: currentProduct.stok + stokDifference,
          });
        }
      } else {
        // Mode Tambah
        await InLogProdService.addLogProduct(productData);

        if (currentProduct) {
          await ProductService.updateProduct(currentProduct._id, {
            ...currentProduct,
            stok: currentProduct.stok + product.stok,
          });
        }
      }

      await fetchProducts();
      await fetchLogProducts();

      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: `Log produk berhasil ${
          isEditMode ? "diupdate" : "ditambahkan"
        }`,
        life: 3000,
      });

      setProductDialog(false);
      setProduct(emptyProduct);
      setShowNewProductFields(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Gagal menyimpan log produk:", error);

      let errorMessage = "Gagal menyimpan log produk";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: errorMessage,
        life: 3000,
      });
    }
  };

  const editProduct = (product) => {
    setProduct({
      _id: product._id, // Pastikan ID disimpan
      nama_produk: product.nama_produk,
      tanggal: new Date(product.tanggal),
      kategori: product.kategori?.id || product.kategori,
      stok: product.stok,
    });
    setIsEditMode(true);
    setProductDialog(true);
  };

  const confirmdeleteLogProduct = (product) => {
    setProduct(product);
    setdeleteLogProductDialog(true);
  };

  const deleteLogProduct = async () => {
    try {
      const currentProduct = productList.find(
        (p) => p.nama_produk === product.nama_produk
      );
      if (currentProduct && currentProduct.stok < product.stok) {
        toast.current.show({
          severity: "error",
          summary: "Gagal",
          detail:
            "Tidak dapat menghapus karena stok telah digunakan dalam transaksi keluar",
          life: 3000,
        });
        return;
      }

      await InLogProdService.deleteLogProduct(product._id);
      setProducts((prevProducts) =>
        prevProducts.filter((val) => val._id !== product._id)
      );

      if (currentProduct) {
        await ProductService.updateProduct(currentProduct._id, {
          ...currentProduct,
          stok: currentProduct.stok - product.stok,
        });
        fetchProducts();
      }

      setdeleteLogProductDialog(false);
      setProduct(products);
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
        detail: error.response?.data?.message || "Gagal menghapus produk",
        life: 3000,
      });
    }
  };

  const exportExcel = () => {
    setExportDialog(true);
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
      "Tanggal Masuk": product.tanggal ? formatDate(product.tanggal) : "",
      "Stok (pcs)": product.stok ? product.stok : 0,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Masuk");
    XLSX.writeFile(wb, "Data_Barang_Masuk.xlsx");
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

  const onCategoryChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      kategori: e.value,
    }));
  };

  const validateProductExists = (nama_produk) => {
    const exists = productList.some((p) => p.nama_produk === nama_produk);
    setIsProductExist(exists);
    return exists;
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";

    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: val,
    }));

    if (name === "nama_produk" && showNewProductFields) {
      validateProductExists(val);
    }
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

  const toggleNewProductFields = () => {
    setProduct({
      ...emptyProduct,
      tanggal: product.tanggal || emptyProduct.tanggal,
      stok: product.stok || emptyProduct.stok,
    });
    setShowNewProductFields(!showNewProductFields);
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
          onClick={() => confirmdeleteLogProduct(rowData)}
          size="small"
        />
      </div>
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
        <h4 className="ml-4 my-3 text-2xl text-sky-700">Barang Masuk</h4>
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
        onClick={hidedeleteLogProductDialog}
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
            header="Tanggal Masuk"
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
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: "5rem" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          ></Column>
        </DataTable>
      </div>

      <Dialog
        visible={productDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header={isEditMode ? "Edit Barang Masuk" : "Tambah Barang Masuk"}
        modal
        className="p-fluid"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="nama_produk" className="font-bold">
            Nama Barang
          </label>
          {showNewProductFields ? (
            <InputText
              id="nama_produk"
              value={product.nama_produk}
              onChange={(e) => onInputChange(e, "nama_produk")}
              required
              autoFocus
              className={classNames("border border-slate-400 rounded-md p-2", {
                "p-invalid border-red-500": submitted && !product.nama_produk,
              })}
            />
          ) : (
            <Dropdown
              value={product.nama_produk}
              onChange={onProductNameChange}
              options={productList?.map((p) => ({
                label: p.nama_produk,
                value: p.nama_produk,
              }))}
              filter
              showClear
              optionLabel="label"
              placeholder="Pilih Produk..."
              className={classNames("border border-slate-400 w-full", {
                "p-invalid border-red-500": submitted && !product.nama_produk,
              })}
            />
          )}

          {showNewProductFields && submitted && !product.nama_produk && (
            <small className="p-error">Nama barang harus diisi</small>
          )}
          {showNewProductFields && isProductExist && (
            <small className="p-error">Barang telah tersedia</small>
          )}
        </div>

        {!showNewProductFields && !isEditMode && (
          <div className="field mb-4">
            <Button
              label="Tambah Produk Baru"
              icon="pi pi-plus"
              className="p-button-text p-button-sm px-2.5 py-1.5 text-sm border-1 border-sky-400 text-white bg-sky-400"
              onClick={toggleNewProductFields}
            />
          </div>
        )}

        {showNewProductFields && (
          <div className="field">
            <label className="font-bold">Kategori</label>
            <Dropdown
              value={product.kategori}
              onChange={onCategoryChange}
              options={categories}
              optionLabel="name"
              optionValue="id"
              showClear
              placeholder="Pilih Kategori"
              className={classNames("border border-slate-400 w-full", {
                "p-invalid border-red-500": submitted && !product.kategori,
              })}
              required
            />
            {submitted && !product.kategori && (
              <small className="p-error">Pilih kategori terlebih dahulu</small>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="tanggal" className="font-bold">
            Tanggal Masuk
          </label>
          <Calendar
            id="tanggal"
            inputClassName={classNames(
              "border border-slate-400 rounded-md p-2",
              {
                "p-invalid border-red-500": submitted && !product.tanggal,
              }
            )}
            className="bg-sky-300 rounded-md"
            value={product.tanggal}
            onChange={(e) => setProduct({ ...product, tanggal: e.value })}
            showIcon
            dateFormat="dd-mm-yy"
            required
          />
          {submitted && !product.tanggal && (
            <small className="p-error">Tanggal masuk harus diisi</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="stok" className="font-bold">
            Stok Masuk
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
            <small className="p-error">Stok masuk harus diisi</small>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={deleteLogProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Konfirmasi Penghapusan"
        modal
        footer={deleteLogProductDialogFooter}
        onHide={hidedeleteLogProductDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "1.5rem" }}
          />
          {product && (
            <span>
              Apakah anda yakin ingin menghapus <b>{product.nama_produk}</b>?
            </span>
          )}
        </div>
      </Dialog>

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
