import { useEffect } from 'react';

export const useAnimatedItems = () => {
    useEffect(() => {
        // Seleccionar los elementos animados solo en el cliente
        const animatedItems = document.querySelectorAll('.animated-item');

        // Configuración de IntersectionObserver
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Dejar de observar una vez que se ha animado
                }
            });
        }, {
            threshold: 0.1
        });

        animatedItems.forEach(item => {
            observer.observe(item);
        });

        return () => observer.disconnect();
    }, []);
};
