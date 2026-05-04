import { Button } from '@/components/ui/button';
import { Loader2, Truck } from 'lucide-react';
import { AddressFormCard } from './details/AddressFormCard';
import { ShippingOptionsCard } from './details/ShippingOptionsCard';
import { CustomizationCard } from './details/CustomizationCard';
import { OrderSummary } from './details/OrderSummary';
import { useFreightCalculator } from './details/useFreightCalculator';
import { useFileUpload } from './details/useFileUpload';
import { CustomerFormData, FreightOption, UploadedFile } from './details/types';
import { isValidCpf } from '@/lib/cpf';

interface PaymentStepDetailsProps {
  customerForm: CustomerFormData;
  setCustomerForm: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  customText: string;
  setCustomText: (v: string) => void;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  amount: number;
  shippingCost: number;
  cartWeight?: number;
  onShippingChange: (cost: number, method: string, city: string, state: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export function PaymentStepDetails({
  customerForm, setCustomerForm, customText, setCustomText,
  uploadedFiles, setUploadedFiles, amount, shippingCost, cartWeight = 0.5,
  onShippingChange, onSubmit, isProcessing,
}: PaymentStepDetailsProps) {
  const {
    freightOptions, selectedMethod, setSelectedMethod, freightLoading,
    freightError, destinationInfo,
  } = useFreightCalculator({ customerForm, setCustomerForm, amount, shippingCost, cartWeight });

  const { isUploading, handleFileUpload, removeFile } = useFileUpload(setUploadedFiles);

  const handleSelectFreight = (option: FreightOption) => {
    setSelectedMethod(option.method);
    onShippingChange(
      option.price,
      option.method,
      destinationInfo?.city || customerForm.city,
      destinationInfo?.state || customerForm.state,
    );
  };

  const cleanCepLen = customerForm.cep.replace(/\D/g, '').length;
  const isValid =
    customerForm.name.trim() &&
    customerForm.phone.trim() &&
    isValidCpf(customerForm.cpf) &&
    customerForm.street.trim() &&
    cleanCepLen === 8 &&
    customerForm.city.trim() &&
    customerForm.state.trim() &&
    selectedMethod !== null;

  return (
    <div className="space-y-4">
      <AddressFormCard customerForm={customerForm} setCustomerForm={setCustomerForm} />

      {(freightLoading || freightOptions.length > 0) && (
        <ShippingOptionsCard
          freightLoading={freightLoading}
          freightOptions={freightOptions}
          freightError={freightError}
          selectedMethod={selectedMethod}
          destinationInfo={destinationInfo}
          onSelect={handleSelectFreight}
        />
      )}

      {cleanCepLen < 8 && freightOptions.length === 0 && !freightLoading && (
        <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center text-sm text-muted-foreground">
          <Truck className="h-5 w-5 mx-auto mb-1 opacity-50" />
          Preencha o CEP acima para ver as opções de envio
        </div>
      )}

      <CustomizationCard
        customText={customText}
        setCustomText={setCustomText}
        uploadedFiles={uploadedFiles}
        isUploading={isUploading}
        handleFileUpload={handleFileUpload}
        removeFile={removeFile}
      />

      <OrderSummary
        subtotal={amount - shippingCost}
        shippingCost={shippingCost}
        selectedMethod={selectedMethod}
        amount={amount}
      />

      <Button onClick={onSubmit} className="w-full" size="lg" disabled={!isValid || isProcessing}>
        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        {!selectedMethod ? 'Selecione o envio para continuar' : 'Continuar para Pagamento'}
      </Button>
    </div>
  );
}
