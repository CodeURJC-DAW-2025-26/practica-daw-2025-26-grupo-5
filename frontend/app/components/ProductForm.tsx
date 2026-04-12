import { Form, Button, Container, Alert, Image } from "react-bootstrap";
import type ProductDTO from "~/dtos/ProductDTO";

interface ProductFormProps {
  product?: Partial<ProductDTO>;
  actionState: [
    state: { success: boolean; error: string | null } | null,
    formAction: (formData: FormData) => void,
    isPending: boolean,
  ];
  onCancel: () => void;
}



/**
 * GENERIC FORM COMPONENT TO CREATE OR EDIT PRODUCTS IN THE WHOLE WEBSITE
 * Product Form Component
 * Reusable form for creating and editing products
 * Used by both product-new and product-edit routes
 */
export default function ProductForm({
  product,
  actionState: [state, formAction, isPending],
  onCancel,
}: ProductFormProps) {
  const isEditing = product?.id;

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">
        {isEditing ? `Edit Product "${product?.name}"` : "New Product"}
      </h2>

      {state?.error && <Alert variant="danger">{state.error}</Alert>}

      <Form action={formAction}>
        {isEditing && <input type="hidden" name="id" value={product?.id} />}

        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Product name"
            defaultValue={product?.name || ""}
            required
            disabled={isPending}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="category">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            name="category"
            placeholder="e.g., Electronics, Books, Sports"
            defaultValue={product?.category || ""}
            required
            disabled={isPending}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="price">
          <Form.Label>Price</Form.Label>
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

        <Form.Group className="mb-3" controlId="location">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            placeholder="e.g., Madrid, Spain"
            defaultValue={product?.location || ""}
            required
            disabled={isPending}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            placeholder="Product description"
            rows={4}
            defaultValue={product?.description || ""}
            required
            disabled={isPending}
          />
        </Form.Group>

        {isEditing && product?.image && (
          <Form.Group className="mb-3">
            <Form.Label>Current Image:</Form.Label>
            <div className="mb-2">
              <Image
                src={`/api/images/${product.image.id}/media`}
                thumbnail
                style={{ maxHeight: "200px" }}
              />
            </div>
            <Form.Check
              type="checkbox"
              id="removeImage"
              name="removeImage"
              label="Remove image"
              disabled={isPending}
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3" controlId="image">
          <Form.Label>
            {isEditing && product?.image ? "Update Image" : "Image"}
          </Form.Label>
          <Form.Control
            type="file"
            name="image"
            accept="image/*"
            disabled={isPending}
          />
        </Form.Group>

        <div className="mb-3">
          <Button
            variant="secondary"
            className="me-2"
            type="button"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
