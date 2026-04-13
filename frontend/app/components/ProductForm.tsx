import { useState, useEffect } from "react";
import { Form, Button, Container, Alert, Image, Spinner } from "react-bootstrap";
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

  // Estados locales para controlar los inputs y permitir que la IA los modifique
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");

  // Si el producto cambia (por ejemplo al cargar), actualizamos el estado
  useEffect(() => {
    if (product?.name) setName(product.name);
    if (product?.description) setDescription(product.description);
  }, [product]);

  const handleAIImprovement = async () => {
    if (onImproveWithAI) {
      // Call the function in product-new.tsx
      const improvedText = await onImproveWithAI(name, description);
      if (improvedText) {
        setDescription(improvedText);
      }
    }
  };

  return (
    <Container className="mt-4 mb-5 animate-fade-in">
      <h2 className="fw-800 mb-4">
        {isEditing ? `Edit Product "${product?.name}"` : "New Product"}
      </h2>

      {state?.error && <Alert variant="danger">{state.error}</Alert>}
      {aiState?.error && <Alert variant="warning">{aiState.error}</Alert>}

      <Form action={formAction}>
        {isEditing && <input type="hidden" name="id" value={product?.id} />}

        <Form.Group className="mb-3" controlId="name">
          <Form.Label className="fw-700">Product Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Audi A3 Sportback"
            required
            disabled={isPending}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="category">
          <Form.Label className="fw-700">Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            placeholder="e.g., Electronics, Books, Sports"
            defaultValue={product?.category || ""}
            required
            disabled={isPending}
          />
        </Form.Group>

        <div className="row">
            <div className="col-md-6">
                <Form.Group className="mb-3" controlId="price">
                <Form.Label className="fw-700">Price (€)</Form.Label>
                <Form.Control
                    type="number"
                    name="price"
                    placeholder="0.00"
                    step="0.01"
                    defaultValue={product?.price || ""}
                    required
                    disabled={isPending}
                />
                </Form.Group>
            </div>
            <div className="col-md-6">
                <Form.Group className="mb-3" controlId="location">
                <Form.Label className="fw-700">Location</Form.Label>
                <Form.Control
                    type="text"
                    name="location"
                    placeholder="e.g., Madrid, Spain"
                    defaultValue={product?.location || ""}
                    required
                    disabled={isPending}
                />
                </Form.Group>
            </div>
        </div>

        <Form.Group className="mb-3" controlId="description">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="fw-700 mb-0">Description</Form.Label>
            
            {/* IA DESC IMPROVEMENT */}
            {onImproveWithAI && (
                <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={handleAIImprovement}
                    disabled={aiState?.loading || isPending || !name}
                    className="btn-ai-sparkle shadow-sm"
                >
                    {aiState?.loading ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                        <i className="fa-solid fa-wand-magic-sparkles me-2"></i>
                    )}
                    Improve with AI
                </Button>
            )}
          </div>
          <Form.Control
            as="textarea"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter some basic details and use the AI to make it sound professional..."
            rows={6}
            required
            disabled={isPending}
          />
        </Form.Group>

        {isEditing && product?.image && (
          <Form.Group className="mb-3">
            <Form.Label className="fw-700">Current Image:</Form.Label>
            <div className="mb-2">
              <Image
                src={`/api/v1/products/${product.image.id}/image`}
                thumbnail
                style={{ maxHeight: "200px" }}
              />
            </div>
            <Form.Check
              type="checkbox"
              id="removeImage"
              name="removeImage"
              label="Remove current image"
              disabled={isPending}
            />
          </Form.Group>
        )}

        <Form.Group className="mb-4" controlId="image">
          <Form.Label className="fw-700">
            {isEditing && product?.image ? "Update Image" : "Product Image"}
          </Form.Label>
          <Form.Control
            type="file"
            name="image"
            accept="image/*"
            disabled={isPending}
          />
        </Form.Group>

        <div className="d-flex gap-3 mt-4">
          <Button type="submit" variant="primary" className="btn-sell px-5" disabled={isPending}>
            {isPending ? "Saving..." : "Save Product"}
          </Button>
          <Button
            variant="light"
            className="btn-about px-4"
            type="button"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
}