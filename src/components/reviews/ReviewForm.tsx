import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ReviewStars } from './ReviewStars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const reviewSchema = z.object({
  customer_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  customer_email: z.string().email('Email inválido').max(255),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').max(1000),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productSlug: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewForm = ({ productSlug, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast.error('Máximo de 4 imagens permitidas');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida.`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of images) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${productSlug}/${fileName}`;

      const { error } = await supabase.storage
        .from('review-images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_slug: productSlug,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          rating,
          title: data.title || null,
          comment: data.comment,
          images: imageUrls,
        });

      if (error) throw error;

      toast.success('Avaliação enviada com sucesso! Ela será publicada após revisão.');
      onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Rating */}
      <div>
        <Label className="mb-2 block">Sua avaliação *</Label>
        <ReviewStars
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>

      {/* Name & Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_name">Seu nome *</Label>
          <Input
            id="customer_name"
            {...register('customer_name')}
            placeholder="João Silva"
            className="mt-1.5"
          />
          {errors.customer_name && (
            <p className="text-sm text-destructive mt-1">{errors.customer_name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="customer_email">Seu email *</Label>
          <Input
            id="customer_email"
            type="email"
            {...register('customer_email')}
            placeholder="joao@email.com"
            className="mt-1.5"
          />
          {errors.customer_email && (
            <p className="text-sm text-destructive mt-1">{errors.customer_email.message}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Título (opcional)</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Resumo da sua experiência"
          className="mt-1.5"
        />
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="comment">Sua avaliação *</Label>
        <Textarea
          id="comment"
          {...register('comment')}
          placeholder="Conte como foi sua experiência com o produto..."
          className="mt-1.5 min-h-[120px]"
        />
        {errors.comment && (
          <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
        )}
      </div>

      {/* Images */}
      <div>
        <Label className="mb-2 block">Fotos (opcional, máx. 4)</Label>
        <div className="flex flex-wrap gap-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar avaliação'
          )}
        </Button>
      </div>
    </form>
  );
};
