export interface CustomerFormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export interface FreightOption {
  method: string;
  price: number;
  originalPrice: number;
  days: string;
  daysMin: number;
  daysMax: number;
}

export interface UploadedFile {
  name: string;
  url: string;
}

export const FALLBACK_FREIGHT_OPTIONS: FreightOption[] = [
  { method: 'PAC', price: 25.90, originalPrice: 25.90, days: '8 a 12 dias úteis', daysMin: 8, daysMax: 12 },
  { method: 'SEDEX', price: 42.50, originalPrice: 42.50, days: '3 a 5 dias úteis', daysMin: 3, daysMax: 5 },
];
