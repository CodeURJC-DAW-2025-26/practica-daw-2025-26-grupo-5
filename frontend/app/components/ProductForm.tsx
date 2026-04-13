import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, Image, Spinner, Card } from "react-bootstrap";
import type ProductDTO from "~/dto/ProductDTO";

interface ProductFormProps {
  product?: Partial<ProductDTO>;
  actionState: [
    state: { success: boolean; error: string | null } | null,
    formAction: (formData: FormData) => void,
    isPending: boolean,
  ];
  onCancel: () => void;
  onImproveWithAI?: (name: string, currentDesc: string) => Promise<string>;
  aiState?: { loading: boolean; error: string | null };
}

export default function ProductForm({
  product,
  actionState: [state, formAction, isPending],
  onCancel,
  onImproveWithAI,
  aiState
}: ProductFormProps) {
  const isEditing = product?.id;
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (product?.name) setName(product.name);
    if (product?.description) setDescription(product.description);
    if (product?.id && !previewUrl) {
      setPreviewUrl(`/api/v1/products/${product.id}/image`);
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAIImprovement = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (onImproveWithAI) {
      const improvedText = await onImproveWithAI(name, description);
      if (improvedText) setDescription(improvedText);
    }
  };

  return (
    <div className="row justify-content-center animate-fade-in">
      <div className="col-xl-11">
        <Card className="clay-card p-4 p-md-4 border-0 shadow-sm bg-white mt-3">
          <header className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fw-800 h3 mb-1">{isEditing ? "Edit Listing" : "Create Listing"}</h1>
              <p className="text-muted small mb-0">Capture and share your design treasure.</p>
            </div>
            <Button variant="light" className="btn-about py-1 px-3 small border" onClick={onCancel}>
              <i className="fa-solid fa-xmark me-2"></i>Cancel
            </Button>
          </header>

          {state?.error && <Alert variant="danger" className="py-2 rounded-4 fw-700 small mb-3">{state.error}</Alert>}

          <Form action={formAction}>
            {isEditing && <input type="hidden" name="id" value={product?.id} />}
            
            <Row className="g-4"> {/* Bajamos de g-5 a g-4 para estrechar el espacio */}
              <Col lg={4} className="border-end-lg">
                <label className="label-categories mb-2 d-block text-uppercase opacity-50 fw-800 x-small">Product Visuals</label>
                <div className="position-relative mb-3">
                  <div className="image-upload-zone rounded-4 d-flex flex-column align-items-center justify-content-center shadow-sm"
                    style={{ height: "260px", backgroundColor: "#f8f9fa", border: "2px dashed #dee2e6", overflow: "hidden", position: "relative" }}>
                    {previewUrl ? (
                      <Image src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Preview" />
                    ) : (
                      <div className="text-center p-3">
                        <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mb-2 mx-auto" style={{ width: "50px", height: "50px" }}>
                          <i className="fa-solid fa-camera fa-lg text-primary"></i>
                        </div>
                        <p className="small fw-800 mb-0">No image selected</p>
                      </div>
                    )}
                    <Form.Control type="file" name="image" accept="image/*" onChange={handleImageChange}
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: "pointer" }} disabled={isPending} />
                  </div>
                </div>

                <div className="p-3 rounded-4 bg-light border mb-2">
                  <label className="label-categories mb-1 d-block text-uppercase opacity-50 fw-800 x-small">Status</label>
                  <div className="d-flex align-items-center gap-2 text-success fw-800 x-small">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Active (Public)</span>
                  </div>
                </div>
              </Col>

              <Col lg={8}>
                <Row className="g-3"> {/* Bajamos a g-3 para los inputs */}
                  <Col md={12}>
                    <Form.Label className="label-categories x-small mb-1">PRODUCT NAME</Form.Label>
                    <div className="search-box py-2 px-3 bg-light rounded-3 border">
                      <Form.Control type="text" name="name" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vintage Eames Chair" className="w-100 border-0 fw-600 bg-transparent shadow-none p-0" required disabled={isPending} />
                    </div>
                  </Col>

                  <Col md={6}>
                    <Form.Label className="label-categories x-small mb-1">CATEGORY</Form.Label>
                    <Form.Select name="category" defaultValue={product?.category || ""}
                      className="border bg-light py-2 fw-700 small rounded-3 shadow-none px-3" required disabled={isPending}>
                      <option disabled value="">Choose...</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Technology">Technology</option>
                      <option value="Cars">Cars</option>
                      <option value="Home">Home</option>
                    </Form.Select>
                  </Col>

                  <Col md={6}>
                    <Form.Label className="label-categories x-small mb-1">PRICE (EUR)</Form.Label>
                    <div className="search-box py-2 px-3 bg-light rounded-3 border d-flex align-items-center">
                      <span className="me-2 fw-800 opacity-25">€</span>
                      <Form.Control type="number" name="price" step="0.01" defaultValue={product?.price || ""}
                        className="w-100 border-0 fw-700 bg-transparent shadow-none p-0" required disabled={isPending} />
                    </div>
                  </Col>

                  <Col md={12}>
                    <Form.Label className="label-categories x-small mb-1">LOCATION</Form.Label>
                    <div className="search-box py-2 px-3 bg-light rounded-3 border d-flex align-items-center">
                      <i className="fa-solid fa-location-dot me-2 opacity-25"></i>
                      <Form.Control type="text" name="location" defaultValue={product?.location || ""}
                        placeholder="e.g. Madrid, Spain" className="w-100 border-0 fw-600 bg-transparent shadow-none p-0" required disabled={isPending} />
                    </div>
                  </Col>

                  <Col md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="label-categories x-small mb-0">DESCRIPTION</Form.Label>
                      <Button variant="outline-primary" size="sm" onClick={handleAIImprovement}
                        disabled={aiState?.loading || isPending || !name} className="btn-ai-sparkle border-0 py-0 px-2" style={{height: '24px'}}>
                        {aiState?.loading ? <Spinner animation="border" size="sm" /> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        <span className="ms-1 fw-800 x-small" style={{fontSize: '10px'}}>Improve with AI</span>
                      </Button>
                    </div>
                    <Form.Control as="textarea" name="description" value={description} onChange={(e) => setDescription(e.target.value)}
                      rows={5} className="border bg-light p-3 fw-600 small rounded-4 shadow-none" style={{ resize: "none" }} required disabled={isPending} />
                  </Col>
                </Row>

                <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                  <Button type="submit" className="btn-sell px-5 py-2 shadow-lg rounded-pill border-0 fw-800" disabled={isPending}>
                    {isPending ? <Spinner size="sm" className="me-2"/> : <i className="fa-solid fa-circle-check me-2"></i>}
                    {isEditing ? "Update Listing" : "Create Listing"}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}