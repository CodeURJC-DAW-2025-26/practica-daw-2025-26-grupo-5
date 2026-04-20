// app/components/Loader.tsx
import React from 'react';

const Loader = () => {
    return (
        <div className="page-spinner-overlay">
                <div className="custom-loader mb-3" />
                <p className="fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>
                    Cargando Stilnovo...
                </p>
        </div>
    );
}

export default Loader;