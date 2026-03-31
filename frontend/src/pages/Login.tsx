import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

/**
 * Login Page Component.
 * Features:
 * - Controlled form inputs.
 * - Integration with Zustand store to save user session.
 * - Basic error handling and loading states.
 */
import api from '../services/api';

export const Login = () => {
    // Local state for form inputs and UI feedback
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const login = useUserStore((state) => state.login);

    /**
     * Handles the form submission.
     * In a real app, this would call your Spring Boot API.
     */

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            /**
             * REAL API CALL:
             * Sending credentials to Spring Boot backend
             */
            const response = await api.post('/auth/login', { username, password });

            // If Spring returns the user data:
            login(response.data);
            navigate('/');

        } catch (err: any) {
            setError('Login failed: Check your credentials or server connection.');
        } finally {
            setLoading(false);
        }
    }


    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <Card className="shadow-lg border-0">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Welcome Back</h2>
                                <p className="text-muted">Please enter your details to login</p>
                            </div>

                            {/* Error Alert */}
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 py-2 fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <small className="text-muted">
                                    Use <strong>admin/admin</strong> to test.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
