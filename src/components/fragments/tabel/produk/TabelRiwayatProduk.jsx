import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import ProductService from "../../../../services/ProductService";
import { Button } from "primereact/button";
import CategoryService from "../../../../services/CategoryService";
import { useNavigate } from "react-router-dom";

export default function TabelRiwayatProduk() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const onGlobalFilterChange = (event) => {
    const value = event.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
  };

  const showDetailProduct = (rowData) => {
    navigate(`/detail-riwayat/${rowData._id}`, {
      state: { product: rowData },
    });
    // console.log(rowData);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex justify-center">
        <Button
          rounded
          size="small"
          className="bg-sky-400 hover:bg-sky-500 text-white text-sm px-3 py-2"
          onClick={() => showDetailProduct(rowData)}
        >
          Show Detail
        </Button>
      </div>
    );
  };

  const categoryBodyTemplate = (rowData) => {
    const category = categories.find((cat) => {
      return cat.id === rowData.kategori;
    });
    return category ? category.name : "Unknown";
  };

  const renderHeader = () => {
    const value = filters["global"] ? filters["global"].value : "";

    return (
      <div className="flex flex-wrap gap-2 align-items-center justify-content-between bg-slate-100 border border-slate-200">
        <h4 className="ml-4 my-3 text-2xl text-sky-700">Riwayat Produk</h4>
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
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ width: "10%" }}
            className="border border-slate-300"
            headerClassName="border border-slate-300"
          />
        </DataTable>
      </div>
    </div>
  );
}
