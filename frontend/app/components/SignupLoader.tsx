import React from 'react';
import styled from 'styled-components';

const Loader = () => {
    const text = "Creating user...".split("");

    return (
        <StyledWrapper>
            <div className="loader" id="loader">
                <div className="loader-wrapper">
                    {text.map((char, index) => (
                        <span key={index} className="loader-letter">
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                    <div className="loader-circle" />
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    /* Fondo con tono azulado Stilnovo y transparencia */
    background: radial-gradient(circle, rgba(219, 234, 254, 0.8) 0%, rgba(191, 219, 254, 0.6) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 240px; 
    height: 240px;
    font-family: "Montserrat", sans-serif;
    font-size: 1.25em;
    font-weight: 800;
    /* Color azul profundo para que resalte sobre el fondo azulado */
    color: #1e3a8a; 
    border-radius: 50%;
    user-select: none;
    letter-spacing: 1px;
  }

  .loader-circle {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    background-color: transparent;
    animation: loader-combined 2.3s linear infinite;
    z-index: 0;
  }

  @keyframes loader-combined {
    0% {
      transform: rotate(90deg);
      box-shadow:
        0 8px 16px 0 rgba(59, 130, 246, 0.4) inset,
        0 0 10px 2px rgba(59, 130, 246, 0.3);
    }
    50% {
      transform: rotate(270deg);
      box-shadow:
        0 8px 16px 0 rgba(30, 64, 175, 0.4) inset,
        0 0 15px 4px rgba(30, 64, 175, 0.2);
    }
    100% {
      transform: rotate(450deg);
      box-shadow:
        0 8px 16px 0 rgba(59, 130, 246, 0.4) inset,
        0 0 10px 2px rgba(59, 130, 246, 0.3);
    }
  }

  .loader-letter {
    display: inline-block;
    opacity: 0.4;
    transform: translateY(0);
    animation: loader-letter-anim 2.4s infinite;
    z-index: 1;
    /* Un ligero sombreado blanco para que la letra "vibre" menos */
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
  }

  /* Delays automáticos */
  ${Array.from({ length: 16 }).map((_, i) => `
    .loader-letter:nth-child(${i + 1}) {
      animation-delay: ${i * 0.12}s;
    }
  `).join("")}

  @keyframes loader-letter-anim {
    0%, 100% {
      opacity: 0.4;
      transform: translateY(0) scale(1);
    }
    20% {
      opacity: 1;
      color: #2563eb; /* Azul brillante en el pico de la animación */
      transform: translateY(-2px) scale(1.1);
      text-shadow: rgba(59, 130, 246, 0.6) 0 0 15px;
    }
    40% {
      opacity: 0.6;
      transform: translateY(0) scale(1);
    }
  }
`;

export default Loader;