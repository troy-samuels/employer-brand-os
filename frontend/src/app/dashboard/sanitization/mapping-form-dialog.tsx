'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  jobTitleMappingSchema,
  JOB_FAMILY_OPTIONS,
  LEVEL_INDICATOR_OPTIONS,
  type JobTitleMappingFormData,
} from '@/features/sanitization/schemas/sanitization.schema';
import {
  createMapping,
  updateMapping,
} from '@/features/sanitization/actions/sanitization-actions';
import type { JobTitleMapping } from '@/features/sanitization/types/sanitization.types';

interface MappingFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  mapping?: JobTitleMapping;
}

export function MappingFormDialog({
  open,
  onClose,
  mode,
  mapping,
}: MappingFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<JobTitleMappingFormData>({
    resolver: zodResolver(jobTitleMappingSchema),
    defaultValues: mapping
      ? {
          internalCode: mapping.internal_code,
          publicTitle: mapping.public_title,
          jobFamily: mapping.job_family || '',
          levelIndicator: mapping.level_indicator || '',
          aliases: mapping.aliases || [],
          isActive: mapping.is_active,
        }
      : {
          internalCode: '',
          publicTitle: '',
          jobFamily: '',
          levelIndicator: '',
          aliases: [],
          isActive: true,
        },
  });

  const isActive = watch('isActive');

  const onSubmit = async (data: JobTitleMappingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result =
        mode === 'create'
          ? await createMapping(data)
          : await updateMapping(mapping!.id, data);

      if (result.success) {
        reset();
        onClose();
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-card border border-border p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {mode === 'create' ? 'Add New Mapping' : 'Edit Mapping'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Internal Code */}
          <div className="space-y-2">
            <Label htmlFor="internalCode">Internal Code *</Label>
            <Input
              id="internalCode"
              placeholder="e.g., L4-Eng-NY"
              {...register('internalCode')}
            />
            {errors.internalCode && (
              <p className="text-xs text-red-600">
                {errors.internalCode.message}
              </p>
            )}
          </div>

          {/* Public Title */}
          <div className="space-y-2">
            <Label htmlFor="publicTitle">Public Title *</Label>
            <Input
              id="publicTitle"
              placeholder="e.g., Senior Software Engineer"
              {...register('publicTitle')}
            />
            {errors.publicTitle && (
              <p className="text-xs text-red-600">
                {errors.publicTitle.message}
              </p>
            )}
          </div>

          {/* Job Family */}
          <div className="space-y-2">
            <Label htmlFor="jobFamily">Job Family</Label>
            <Select
              onValueChange={(value) => setValue('jobFamily', value)}
              defaultValue={mapping?.job_family || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job family" />
              </SelectTrigger>
              <SelectContent>
                {JOB_FAMILY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Indicator */}
          <div className="space-y-2">
            <Label htmlFor="levelIndicator">Level</Label>
            <Select
              onValueChange={(value) => setValue('levelIndicator', value)}
              defaultValue={mapping?.level_indicator || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_INDICATOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked === true)
              }
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              Active (will be used for sanitization)
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Add Mapping'
                  : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
