/**
 * @module app/dashboard/sanitization/add-mapping-button
 * Module implementation for add-mapping-button.tsx.
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MappingFormDialog } from './mapping-form-dialog';

/**
 * Executes AddMappingButton.
 * @returns The resulting value.
 */
export function AddMappingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Mapping
      </Button>

      <MappingFormDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
      />
    </>
  );
}
