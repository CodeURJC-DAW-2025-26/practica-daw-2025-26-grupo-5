import { Spinner } from 'react-bootstrap';
import { useLoadingStore } from '../store/useLoadingStore';

/**
 * Global Spinner Component.
 * It covers the screen with a semi-transparent overlay when 'isLoading' is true.
 */
export const GlobalSpinner = () => {
    const isLoading = useLoadingStore((state) => state.isLoading);

    if (!isLoading) return null;

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 9999 }}>
            <div className="text-center text-white">
                <Spinner animation="border" variant="primary" role="status" style={{ width: '4rem', height: '4rem' }} />
                <p className="mt-3 fw-bold">Loading data...</p>
            </div>
        </div>
    );
};
