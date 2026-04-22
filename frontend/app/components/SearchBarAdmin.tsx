import React from 'react';
import { Card, Form, Row, Col, Stack, Button } from 'react-bootstrap';

interface SearchBarProps {
    isSearching: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClear: () => void;

    variant: 'simple' | 'advanced';

    simpleLabel?: string;
    simplePlaceholder?: string;
    simpleValue?: string;
    onSimpleChange?: (val: string) => void;

    advancedMode?: 'id' | 'users';
    onAdvancedModeChange?: (mode: 'id' | 'users') => void;
    idLabel?: string;
    idPlaceholder?: string;
    idValue?: string;
    onIdChange?: (val: string) => void;
    sellerValue?: string;
    onSellerChange?: (val: string) => void;
    buyerValue?: string;
    onBuyerChange?: (val: string) => void;
}

export default function SearchBar({
    isSearching,
    onSubmit,
    onClear,
    variant,
    simpleLabel,
    simplePlaceholder,
    simpleValue,
    onSimpleChange,
    advancedMode,
    onAdvancedModeChange,
    idLabel,
    idPlaceholder,
    idValue,
    onIdChange,
    sellerValue,
    onSellerChange,
    buyerValue,
    onBuyerChange
}: SearchBarProps) {
    return (
        <Card className="clay-card border-0 p-3 mb-4">
            <Card.Body>
                <Form onSubmit={onSubmit}>
                    <Row className="g-3 align-items-end">

                        {variant === 'simple' && (
                            <Col md={9}>
                                <Form.Label className="fw-700 small text-uppercase text-muted">
                                    {simpleLabel}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={simpleValue || ''}
                                    onChange={(e) => onSimpleChange?.(e.target.value)}
                                    placeholder={simplePlaceholder}
                                    className="rounded-3 py-2 bg-light border-0"
                                />
                            </Col>
                        )}

                        {variant === 'advanced' && (
                            <>
                                {advancedMode === 'id' ? (
                                    <Col xs={12} lg={9}>
                                        <Form.Label className="fw-700 small text-uppercase text-muted">
                                            {idLabel}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={idValue || ''}
                                            onChange={(e) => onIdChange?.(e.target.value)}
                                            placeholder={idPlaceholder}
                                            className="rounded-3 py-2 bg-light border-0"
                                        />
                                    </Col>
                                ) : (
                                    <>
                                        <Col xs={12} lg={4}>
                                            <Form.Label className="fw-700 small text-uppercase text-muted">Seller</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={sellerValue || ''}
                                                onChange={(e) => onSellerChange?.(e.target.value)}
                                                placeholder="Type seller name..."
                                                className="rounded-3 py-2 bg-light border-0"
                                            />
                                        </Col>
                                        <Col xs={12} lg={4}>
                                            <Form.Label className="fw-700 small text-uppercase text-muted">Buyer</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={buyerValue || ''}
                                                onChange={(e) => onBuyerChange?.(e.target.value)}
                                                placeholder="Type buyer name..."
                                                className="rounded-3 py-2 bg-light border-0"
                                            />
                                        </Col>
                                    </>
                                )}

                                <Col xs={12} lg={3}>
                                    <Form.Label className="fw-700 small text-uppercase text-muted">Search mode</Form.Label>
                                    <Form.Select
                                        value={advancedMode}
                                        onChange={(e) => onAdvancedModeChange?.(e.target.value as 'id' | 'users')}
                                        className="rounded-3 py-2 bg-light border-0"
                                    >
                                        <option value="id">by id</option>
                                        <option value="users">by users</option>
                                    </Form.Select>
                                </Col>
                            </>
                        )}

                        {/* COMMON BUTTONS */}
                        {variant === 'simple' && (
                            <Col md={3}>
                                <Stack direction="horizontal" gap={2} className="justify-content-end">
                                    <Button type="submit" variant="dark" className="rounded-pill px-4 fw-700" disabled={isSearching}>
                                        {isSearching ? 'Searching...' : 'Search'}
                                    </Button>
                                    <Button type="button" variant="light" className="rounded-pill px-4 fw-700" onClick={onClear} disabled={isSearching}>
                                        Clear
                                    </Button>
                                </Stack>
                            </Col>
                        )}
                    </Row>

                    {variant === 'advanced' && (
                        <Stack direction="horizontal" gap={2} className="justify-content-end mt-3">
                            <Button type="submit" variant="dark" className="fw-700 rounded-pill px-4" disabled={isSearching}>
                                {isSearching ? 'Searching...' : 'Search'}
                            </Button>
                            <Button type="button" variant="light" className="fw-700 rounded-pill px-4" onClick={onClear} disabled={isSearching}>
                                Clear
                            </Button>
                        </Stack>
                    )}
                </Form>
            </Card.Body>
        </Card>
    );
}