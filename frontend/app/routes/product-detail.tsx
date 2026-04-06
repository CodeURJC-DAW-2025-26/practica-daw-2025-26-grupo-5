import { useNavigate } from "react-router";
import type { Route } from "./+types/product-detail";
import { getProduct, removeProduct } from "~/services/products-service";
import {
  Alert,
  Button,
  ButtonGroup,
  Container,
  Image,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { useUserStore } from "~/stores/useUserStore";
import { useState } from "react";

/**
 * Client-side loader: Fetches product details before rendering
 */
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return await getProduct(params.id!);
}

/**
 * Product Detail Component
 * Displays comprehensive product information with seller details
 */
export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { user } = useUserStore();
  const product = loaderData;
  const navigate = useNavigate();

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPendingDelete, setPendingDelete] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function handleOpenDeleteDialog() {
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog() {
    if (isPendingDelete) {
      return;
    }
    setDeleteDialogOpen(false);
    setDeleteError(null);
  }

  async function handleDelete() {
    setPendingDelete(true);
    setDeleteError(null);
    try {
      await removeProduct(product.id);
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError("Error deleting product");
      setPendingDelete(false);
    }
  }

  return (
    <>
      <Container className="mt-4 mb-5">
        <h2>Product "{product.name}"</h2>

        <Image
          src={
            product.image
              ? `/api/images/${product.image.id}/media`
              : `/no_image.png`
          }
          className="mb-4"
          alt={product.image ? "Product Image" : "No Image Available"}
          fluid
        />

        <p>
          <b>Price: </b>${product.price.toFixed(2)}
        </p>

        <p>
          <b>Category: </b>
          {product.category}
        </p>

        <p>
          <b>Location: </b>
          {product.location}
        </p>

        <p>{product.description}</p>

        <p>
          <b>Seller:</b>
        </p>

        <ListGroup>
          <ListGroup.Item>
            <strong>{product.seller.name}</strong>
          </ListGroup.Item>
          <ListGroup.Item>Rating: {product.seller.rating}</ListGroup.Item>
          <ListGroup.Item>Email: {product.seller.email}</ListGroup.Item>
        </ListGroup>

        {user && (
          <ButtonGroup className="mt-4">
            {user.roles.includes("ADMIN") && (
              <Button variant="danger" onClick={handleOpenDeleteDialog}>
                Remove
              </Button>
            )}
            {user.id === product.seller.id && (
              <Button
                variant="warning"
                onClick={() => navigate(`/product/${product.id}/edit`)}
              >
                Edit
              </Button>
            )}
          </ButtonGroup>
        )}

        <br />
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => navigate("/")}
        >
          Back to all products
        </Button>
      </Container>

      <Modal show={isDeleteDialogOpen} onHide={handleCloseDeleteDialog}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete <b>"{product.name}"</b>?
          </p>
          <p className="text-muted">This action cannot be undone.</p>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseDeleteDialog}
            disabled={isPendingDelete}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isPendingDelete}
          >
            {isPendingDelete ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
