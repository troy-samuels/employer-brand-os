'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MappingFormDialog } from './mapping-form-dialog';

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
