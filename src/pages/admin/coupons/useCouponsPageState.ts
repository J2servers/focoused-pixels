import { useState, useMemo } from 'react';
import { differenceInDays, isPast } from 'date-fns';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, type Coupon } from '@/hooks/useCoupons';
import { CouponFormData, initialCouponForm, QuickTemplate } from './types';

export function useCouponsPageState() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(initialCouponForm);

  const { data: coupons = [], isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const stats = useMemo(() => ({
    activeCount: coupons.filter(c => c.is_active).length,
    percentCount: coupons.filter(c => c.type === 'percentage').length,
    fixedCount: coupons.filter(c => c.type === 'fixed').length,
    totalUsage: coupons.reduce((s, c) => s + c.usage_count, 0),
    expiringCoupons: coupons.filter(c => c.end_date && !isPast(new Date(c.end_date)) && differenceInDays(new Date(c.end_date), new Date()) <= 7),
    expiredCoupons: coupons.filter(c => c.end_date && isPast(new Date(c.end_date)) && c.is_active),
    topCoupons: [...coupons].sort((a, b) => b.usage_count - a.usage_count).slice(0, 3),
  }), [coupons]);

  const openCreateDialog = () => { setFormData(initialCouponForm); setEditingCoupon(null); setIsDialogOpen(true); };

  const openEditDialog = (c: Coupon) => {
    setFormData({
      code: c.code, description: c.description || '', type: c.type, value: c.value,
      min_order_value: c.min_order_value, max_discount: c.max_discount,
      usage_limit: c.usage_limit, is_active: c.is_active,
      start_date: c.start_date ? c.start_date.split('T')[0] : '',
      end_date: c.end_date ? c.end_date.split('T')[0] : '',
    });
    setEditingCoupon(c);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };
    if (editingCoupon) {
      await updateCoupon.mutateAsync({ id: editingCoupon.id, ...payload });
    } else {
      await createCoupon.mutateAsync(payload);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) { await deleteCoupon.mutateAsync(deleteId); setDeleteId(null); }
  };

  const handleQuickCreate = (tpl: QuickTemplate) => {
    setFormData({ ...initialCouponForm, code: tpl.code, type: tpl.type, value: tpl.value, description: tpl.desc, is_active: true });
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (c: Coupon) => {
    setFormData({
      code: `${c.code}_COPY`, description: c.description || '', type: c.type, value: c.value,
      min_order_value: c.min_order_value, max_discount: c.max_discount,
      usage_limit: c.usage_limit, is_active: true, start_date: '', end_date: '',
    });
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  return {
    coupons, isLoading, stats,
    isDialogOpen, setIsDialogOpen, editingCoupon,
    deleteId, setDeleteId, formData, setFormData,
    openCreateDialog, openEditDialog, handleSubmit, handleDelete,
    handleQuickCreate, handleDuplicate,
  };
}
