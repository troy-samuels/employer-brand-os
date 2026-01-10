'use client';

import { MappingFormDialog } from './mapping-form-dialog';
import type { JobTitleMapping } from '@/features/sanitization/types/sanitization.types';

interface EditMappingDialogProps {
  mapping: JobTitleMapping;
  open: boolean;
  onClose: () => void;
}

export function EditMappingDialog({
  mapping,
  open,
  onClose,
}: EditMappingDialogProps) {
  return (
    <MappingFormDialog
      open={open}
      onClose={onClose}
      mode="edit"
      mapping={mapping}
    />
  );
}
