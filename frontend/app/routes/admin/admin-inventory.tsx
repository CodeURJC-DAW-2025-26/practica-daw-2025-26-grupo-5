import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { redirect } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import { Modal, Button, Form } from 'react-bootstrap';
import { getAdminProducts, updateProduct, deleteProduct, createProduct } from '~/services/admin-service';
import type ProductDTO from '~/dto/ProductDTO';
import AdminHeader from '~/components/admin/AdminHeader';
import ConfirmModal from '~/components/confirm-modal';
import FormInput from '~/components/form-input';
import FormSelect from '~/components/form-select';

// Estilos obligatorios de Ag-Grid
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export async function clientLoader() {
  try {
    const data = await getAdminProducts(0, 100);
    return data || {};
  } catch (error) {
    throw redirect('/login');
  }
}

export default function AdminInventory({ loaderData }: { loaderData: any }) {
  const [rowData, setRowData] = useState<ProductDTO[]>(loaderData.content || []);
  const [selected, setSelected] = useState<ProductDTO | null>(null);
  const [modalType, setModalType] = useState<'form' | 'delete' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<any>();

  // Abre modal para Crear (sin item) o Editar (con item)
  const openForm = (item: ProductDTO | null = null) => {
    setSelected(item);
    methods.reset(item || { name: '', category: '', price: 0, status: 'Active', description: '', location: '' });
    setModalType('form');
  };

  const handleSave = async (data: any) => {
    setIsLoading(true);
    try {
      if (selected) {
        const updated = await updateProduct(selected.id, data);
        setRowData(prev => prev.map(p => p.id === selected.id ? { ...p, ...updated } : p));
      } else {
        const created = await createProduct(data);
        setRowData(prev => [created, ...prev]);
      }
      setModalType(null);
    } catch (e) {
      alert('Error saving product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      await deleteProduct(selected.id);
      setRowData(prev => prev.filter(p => p.id !== selected.id));
      setModalType(null);
    } catch (e) {
      alert('Error deleting product');
    } finally {
      setIsLoading(false);
    }
  };

  // Definición de columnas con tipo any[] para evitar errores de TypeScript
  const columnDefs: any[] = [
    { field: 'id', headerName: 'ID', width: 80, cellRenderer: (p: any) => <small className="text-muted">#{p.data.id}</small> },
    { 
      field: 'name', headerName: 'Product', width: 250,
      cellRenderer: (p: any) => (
        <div className="d-flex align-items-center gap-2">
          <img 
            src={p.data.image?.id ? `http://localhost:8443/api/v1/images/${p.data.image.id}` : 'https://placehold.co/32x32?text=N/A'} 
            width="32" height="32" className="rounded shadow-sm" style={{objectFit: 'cover'}}
          />
          <div>
            <p className="fw-bold mb-0 small">{p.data.name}</p>
            <p className="x-small text-muted mb-0">{p.data.category}</p>
          </div>
        </div>
      )
    },
    { field: 'price', headerName: 'Price', width: 110, cellRenderer: (p: any) => <span className="fw-bold text-primary">{p.value?.toFixed(2)} €</span> },
    { field: 'stock', headerName: 'Stock', width: 90 },
    { 
      field: 'status', headerName: 'Status', width: 110,
      cellRenderer: (p: any) => (
        <span className={`badge ${p.value === 'Active' ? 'bg-success' : 'bg-secondary'}`} style={{fontSize: '0.7rem'}}>
          {p.value?.toUpperCase()}
        </span>
      )
    },
    {
      headerName: 'Actions', width: 150, sortable: false, filter: false,
      cellRenderer: (p: any) => (
        <div className="d-flex gap-2 pt-1">
          <button className="btn btn-sm btn-action-admin" onClick={() => openForm(p.data)}><i className="fa-solid fa-pen" /></button>
          <button className="btn btn-sm btn-danger-clay" onClick={() => { setSelected(p.data); setModalType('delete'); }}><i className="fa-solid fa-trash" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <AdminHeader title="Global Inventory" subtitle={`${rowData.length} products total`} />
        <Button onClick={() => openForm()} className="btn-action-admin fw-bold border-0 shadow-sm">
          <i className="fa-solid fa-plus me-2" />Add Product
        </Button>
      </div>

      <div className="clay-card p-3 bg-white shadow-sm" style={{ borderRadius: '15px' }}>
        <div className="ag-theme-quartz" style={{ height: "600px", width: "100%" }}>
          <AgGridReact 
            rowData={rowData} 
            columnDefs={columnDefs} 
            pagination={true} 
            paginationPageSize={10}
            defaultColDef={{ sortable: true, filter: true, resizable: true }}
          />
        </div>
      </div>

      {/* Modal Unificado (Add/Edit) */}
      <Modal show={modalType === 'form'} onHide={() => setModalType(null)} centered size="lg">
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold">{selected ? 'Edit' : 'Add'} Product</Modal.Title></Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <FormProvider {...methods}>
            <Form onSubmit={methods.handleSubmit(handleSave)}>
              <FormInput name="name" label="Product Name" required />
              <div className="row">
                <div className="col-md-6"><FormSelect name="category" label="Category" required options={[{value:'Tech', label:'Tech'}, {value:'Home', label:'Home'}, {value:'Cars', label:'Cars'}]} /></div>
                <div className="col-md-6"><FormInput name="price" label="Price (€)" type="number" required /></div>
              </div>
              <FormInput name="location" label="Location" required />
              <FormInput name="description" label="Description" required />
              <FormSelect name="status" label="Status" options={[{value:'Active', label:'Active'}, {value:'Sold', label:'Sold'}, {value:'Hidden', label:'Hidden'}]} />
              <Button type="submit" className="w-100 mt-4 btn-action-admin border-0 py-2 fw-bold" disabled={isLoading}>
                {isLoading ? 'Processing...' : (selected ? 'Update Product' : 'Create Product')}
              </Button>
            </Form>
          </FormProvider>
        </Modal.Body>
      </Modal>

      {/* Confirmación Borrado */}
      <ConfirmModal 
        show={modalType === 'delete'} 
        title="Delete Product?" 
        message={`Confirm deletion of "${selected?.name}"?`} 
        confirmText="Delete" variant="danger" isLoading={isLoading} 
        onConfirm={handleDelete} onCancel={() => setModalType(null)} 
      />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="alert alert-danger m-5">
      <h4>Inventory Error</h4>
      <p>{error.message}</p>
      <Button variant="outline-danger" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
}