import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CepInfo {
  cep: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// Brazilian state capital coordinates for distance estimation
const stateCoords: Record<string, [number, number]> = {
  AC: [-9.97, -67.81], AL: [-9.66, -35.74], AP: [0.03, -51.05],
  AM: [-3.12, -60.02], BA: [-12.97, -38.51], CE: [-3.72, -38.54],
  DF: [-15.78, -47.93], ES: [-20.32, -40.34], GO: [-16.68, -49.25],
  MA: [-2.53, -44.28], MT: [-15.60, -56.10], MS: [-20.44, -54.65],
  MG: [-19.92, -43.94], PA: [-1.46, -48.50], PB: [-7.12, -34.86],
  PR: [-25.43, -49.27], PE: [-8.05, -34.87], PI: [-5.09, -42.80],
  RJ: [-22.91, -43.17], RN: [-5.79, -35.21], RS: [-30.03, -51.23],
  RO: [-8.76, -63.90], RR: [2.82, -60.67], SC: [-27.60, -48.55],
  SP: [-23.55, -46.63], SE: [-10.91, -37.07], TO: [-10.18, -48.33],
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destinationCep, originCep, productPrice, weight, freeShippingMinimum } = await req.json();

    if (!destinationCep || typeof destinationCep !== 'string') {
      return new Response(JSON.stringify({ error: 'CEP de destino é obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanDest = destinationCep.replace(/\D/g, '');
    const cleanOrigin = (originCep || '01310100').replace(/\D/g, '');

    if (cleanDest.length !== 8) {
      return new Response(JSON.stringify({ error: 'CEP inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch destination address from ViaCEP
    const destRes = await fetch(`https://viacep.com.br/ws/${cleanDest}/json/`);
    const destData: CepInfo = await destRes.json();

    if (destData.erro) {
      return new Response(JSON.stringify({ error: 'CEP não encontrado' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch origin address
    const origRes = await fetch(`https://viacep.com.br/ws/${cleanOrigin}/json/`);
    const origData: CepInfo = await origRes.json();

    const origUF = origData.uf || 'SP';
    const destUF = destData.uf || 'SP';

    // Calculate approximate distance
    const origCoord = stateCoords[origUF] || stateCoords['SP'];
    const destCoord = stateCoords[destUF] || stateCoords['SP'];
    const distance = haversineDistance(origCoord[0], origCoord[1], destCoord[0], destCoord[1]);

    const productWeight = weight || 0.5; // kg
    const price = productPrice || 0;

    // Base freight calculation based on distance and weight
    const distanceFactor = Math.max(1, distance / 500); // normalize
    const weightFactor = Math.max(1, productWeight / 0.3);

    const pacBase = 8 + (distanceFactor * 4.5) + (weightFactor * 2);
    const sedexBase = pacBase * 1.9;
    const expressBase = sedexBase * 1.5;

    // Same state discount
    const sameState = origUF === destUF;
    const stateDiscount = sameState ? 0.7 : 1;

    const pacPrice = Math.round(pacBase * stateDiscount * 100) / 100;
    const sedexPrice = Math.round(sedexBase * stateDiscount * 100) / 100;
    const expressPrice = Math.round(expressBase * stateDiscount * 100) / 100;

    // Days estimation based on distance
    const pacDaysMin = sameState ? 5 : Math.ceil(6 + distance / 800);
    const pacDaysMax = pacDaysMin + 4;
    const sedexDaysMin = sameState ? 2 : Math.ceil(3 + distance / 1500);
    const sedexDaysMax = sedexDaysMin + 2;
    const expressDaysMin = sameState ? 1 : Math.ceil(1 + distance / 2000);
    const expressDaysMax = expressDaysMin + 1;

    // Free shipping check
    const freeShippingMinimum = 159;
    const hasFreeShipping = price >= freeShippingMinimum;

    const results = [
      {
        method: 'PAC',
        price: hasFreeShipping ? 0 : pacPrice,
        originalPrice: pacPrice,
        days: `${pacDaysMin} a ${pacDaysMax} dias úteis`,
        daysMin: pacDaysMin,
        daysMax: pacDaysMax,
      },
      {
        method: 'SEDEX',
        price: hasFreeShipping ? 0 : sedexPrice,
        originalPrice: sedexPrice,
        days: `${sedexDaysMin} a ${sedexDaysMax} dias úteis`,
        daysMin: sedexDaysMin,
        daysMax: sedexDaysMax,
      },
      {
        method: 'SEDEX 10',
        price: expressPrice, // Express never free
        originalPrice: expressPrice,
        days: `${expressDaysMin} a ${expressDaysMax} dias úteis`,
        daysMin: expressDaysMin,
        daysMax: expressDaysMax,
      },
    ];

    return new Response(JSON.stringify({
      results,
      destination: {
        city: destData.localidade,
        state: destData.uf,
        cep: cleanDest,
      },
      hasFreeShipping,
      distance: Math.round(distance),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Freight calculation error:', error);
    return new Response(JSON.stringify({ error: 'Erro ao calcular frete' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
