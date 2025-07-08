import React, { useState, useEffect, useRef } from "react";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Tag } from "primereact/tag";
import ProductService from "../../../../services/ProductService";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import CategoryService from "../../../../services/CategoryService";
import InLogProdService from "../../../../services/InLogProdService";

export default function TabelRingkasanProduk() {
  let emptyProduct = {
    _id: "",
    kode_produk: "",
    nama_produk: "",
    stok: 0,
    kategori: "",
  };

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [productsLog, setProductsLog] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const toast = useRef(null);

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

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getAllProducts();
      const productList = response.Produk || [];
      const products = productList.map((item) => ({
        _id: item._id,
        kode_produk: item ? item.kode_produk : "N/A",
        nama_produk: item ? item.nama_produk : "N/A",
        kategori: item ? item.kategori : "Unknown",
        stok: item.stok,
      }));
      setProducts(products);
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

  const fetchProductsLog = async () => {
    try {
      const response = await InLogProdService.getAllLogProducts();
      setProductsLog(response.LogProduk || []);
      console.log("Response API Log Products: ", response);
    } catch (error) {
      console.error("Gagal mengambil produk dalam log:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProductsLog();
  }, []);

  const editProduct = (product) => {
    setProduct({ ...product });
    setSubmitted(false);
    setProductDialog(true);
  };

  const confirmDeleteProduct = (product) => {
    // Cek apakah produk ada di array productsLog
    const isInLog = productsLog.some((log) => log.produk._id === product._id);

    if (isInLog) {
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Produk yang tersedia pada log tidak dapat dihapus",
        life: 4000,
      });
      return;
    }

    // Jika tidak ada, tampilkan dialog confirm delete
    setProduct(product);
    setDeleteProductDialog(true);
  };

  const deleteProduct = async () => {
    try {
      await ProductService.deleteProduct(product._id);
      setDeleteProductDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Produk berhasil dihapus",
        life: 3000,
      });
      fetchProducts();
    } catch (error) {
      console.error("Gagal menghapus produk: ", error);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: "Gagal menghapus produk",
        life: 3000,
      });
    }
  };

  const saveProduct = async () => {
    setSubmitted(true);

    try {
      await ProductService.updateProduct(product._id, product);
      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Produk berhasil diperbaharui",
        life: 3000,
      });
      setProductDialog(false);
      fetchProducts();
    } catch (error) {
      console.error(
        "Gagal mengupdate produk:",
        error.response?.data || error.message
      );
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: error.response?.data?.message || "Gagal mengupdate produk",
        life: 3000,
      });
    } finally {
      setSubmitted(false);
    }
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
          onClick={() => confirmDeleteProduct(rowData)}
          size="small"
        />
      </div>
    );
  };

  const categoryBodyTemplate = (rowData) => {
    const category = categories.find((cat) => {
      return cat.id === rowData.kategori;
    });
    return category ? category.name : "Unknown";
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <div className="flex justify-center">
        <Tag
          value={rowData.stok}
          severity={getSeverity(rowData.stok)}
          style={{ fontSize: "1rem", minWidth: "2.5rem" }}
        />
      </div>
    );
  };

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
        <h4 className="ml-4 my-3 text-2xl text-sky-700">Ringkasan Produk</h4>
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

  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Batal"
        icon="pi pi-times"
        outlined
        onClick={() => setProductDialog(false)}
        className="px-2 py-1.5 border-1 border-sky-400 text-sm text-sky-400 mr-2"
      />
      <Button
        label="Simpan"
        icon="pi pi-check"
        className="px-2.5 py-1.5 text-sm border-1 border-sky-400 text-white bg-sky-400"
        onClick={saveProduct}
      />
    </React.Fragment>
  );

  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={() => setDeleteProductDialog(false)}
        className="px-2 py-1.5 border-1 border-sky-400 text-sm text-sky-400 mr-2"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={deleteProduct}
        className="px-2.5 py-1.5 text-sm border-1 border-red-400 text-white bg-red-400"
      />
    </React.Fragment>
  );

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _product = { ...product };
    _product[`${name}`] = val;
    setProduct(_product);
  };

  const onCategoryChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      kategori: e.value,
    }));
  };

  const header = renderHeader();

  return (
    <div>
      <Toast ref={toast} />
      <div className="card ml-1 mt-5 rounded-lg shadow-lg">
        <DataTable
          value={products}
          dataKey="id"
          paginator
          rows={5}
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
          header={header}
          tableClassName="border border-slate-300"
          tableStyle={{ minWidth: "50rem" }}
          onFilter={(e) => setFilters(e.filters)}
          stateStorage="session"
          stateKey="dt-state-demo-local"
          emptyMessage="Tidak ada data ditemukan."
        >
          <Column
            field="kode_produk"
            header="Kode Produk"
            style={{ width: "20%" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          />
          <Column
            field="nama_produk"
            header="Nama Produk"
            sortable
            style={{ width: "25%" }}
            className="border border-slate-300"
            headerClassName="border border-gray-300"
          />
          <Column
            field="kategori"
            header="Kategori Produk"
            body={categoryBodyTemplate}
            style={{ width: "15%" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          />
          <Column
            field="stok"
            header="Stok Produk"
            body={statusBodyTemplate}
            sortable
            style={{ width: "10%" }}
            className="border border-slate-300"
            headerClassName="border border-gray-300"
          />
          <Column
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ width: "10%" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          />
        </DataTable>

        <Dialog
          visible={productDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Edit Produk"
          modal
          className="p-fluid"
          footer={productDialogFooter}
          onHide={() => setProductDialog(false)}
        >
          <div className="field">
            <label htmlFor="kode_produk" className="font-bold">
              Kode Produk
            </label>
            <InputText
              id="kode_produk"
              value={product.kode_produk}
              onChange={(e) => onInputChange(e, "kode_produk")}
              required
              autoFocus
              className={classNames("border border-slate-400 rounded-md p-2", {
                "p-invalid border-red-500": submitted && !product.kode_produk,
              })}
              placeholder="Isi Kode Produk..."
            />
            {submitted && !product.kode_produk && (
              <small className="p-error">Kode produk harus diisi.</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="nama_produk" className="font-bold">
              Nama Produk
            </label>
            <InputText
              id="nama_produk"
              value={product.nama_produk}
              onChange={(e) => onInputChange(e, "nama_produk")}
              required
              className={classNames("border border-slate-400 rounded-md p-2", {
                "p-invalid border-red-500": submitted && !product.nama_produk,
              })}
              placeholder="Isi Nama Produk..."
            />
            {submitted && !product.nama_produk && (
              <small className="p-error">Nama produk harus diisi.</small>
            )}
          </div>
          <div className="field">
            <label className="font-bold">Kategori</label>
            <Dropdown
              value={product.kategori}
              onChange={onCategoryChange}
              options={categories}
              optionLabel="name"
              optionValue="id"
              showClear
              placeholder="Pilih Kategori..."
              className={classNames("border border-slate-400 w-full", {
                "p-invalid border-red-500": submitted && !product.kategori,
              })}
              required
            />
            {submitted && !product.kategori && (
              <small className="p-error">Pilih kategori terlebih dahulu</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="stok" className="font-bold">
              Stok
            </label>
            <InputNumber
              id="stok"
              value={product.stok}
              disabled
              inputClassName="border border-slate-400 p-2 rounded-md"
            />
          </div>
        </Dialog>

        <Dialog
          visible={deleteProductDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Confirm"
          modal
          footer={deleteProductDialogFooter}
          onHide={() => setDeleteProductDialog(false)}
        >
          <div className="confirmation-content">
            <i
              className="pi pi-exclamation-triangle mr-3"
              style={{ fontSize: "2rem" }}
            />
            {product && (
              <span>
                Apakah Anda yakin ingin menghapus <b>{product.nama_produk}</b>?
              </span>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
}
