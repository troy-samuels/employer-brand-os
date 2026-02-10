/**
 * @module app/dashboard/sanitization/edit-mapping-dialog
 * Module implementation for edit-mapping-dialog.tsx.
 */

'use client';

import { MappingFormDialog } from './mapping-form-dialog';
import type { JobTitleMapping } from '@/features/sanitization/types/sanitization.types';

interface EditMappingDialogProps {
  mapping: JobTitleMapping;
  open: boolean;
  onClose: () => void;
}

/**
 * Executes EditMappingDialog.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
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
