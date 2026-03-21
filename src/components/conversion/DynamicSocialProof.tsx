/**
 * DynamicSocialProof - Shows "Maria de SP acabou de comprar..." toast notifications
 */
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const FIRST_NAMES = [
  'Maria', 'Ana', 'Juliana', 'Fernanda', 'Camila', 'Larissa', 'Beatriz',
  'Carlos', 'João', 'Pedro', 'Lucas', 'Rafael', 'Bruno', 'Marcos',
  'Patricia', 'Renata', 'Aline', 'Gabriela', 'Thiago', 'Felipe',
];

const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Brasília',
  'Porto Alegre', 'Salvador', 'Recife', 'Fortaleza', 'Goiânia',
  'Campinas', 'Florianópolis', 'Manaus', 'Vitória', 'Natal',
];

const PRODUCTS = [
  'Letreiro em Acrílico', 'Display QR Code', 'Crachá Personalizado',
  'Placa Neon LED', 'Porta-Retrato Acrílico', 'Totem de Mesa',
  'Placa de Sinalização', 'Display de Produtos',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomMinutesAgo(): number {
  return Math.floor(Math.random() * 30) + 2;
}

export function DynamicSocialProof() {
  const shown = useRef(0);

  useEffect(() => {
    // Show first after 20-40s, then every 45-90s
    const firstDelay = 20000 + Math.random() * 20000;

    const showNotification = () => {
      if (shown.current >= 8) return; // max 8 per session
      
      const name = getRandomItem(FIRST_NAMES);
      const city = getRandomItem(CITIES);
      const product = getRandomItem(PRODUCTS);
      const minutes = getRandomMinutesAgo();

      toast(`${name} de ${city}`, {
        description: `comprou ${product} há ${minutes} min`,
        duration: 5000,
        position: 'bottom-left',
        icon: '🛒',
      });

      shown.current += 1;
    };

    const firstTimer = setTimeout(() => {
      showNotification();
      const interval = setInterval(() => {
        showNotification();
      }, 45000 + Math.random() * 45000);
      return () => clearInterval(interval);
    }, firstDelay);

    return () => clearTimeout(firstTimer);
  }, []);

  return null;
}

