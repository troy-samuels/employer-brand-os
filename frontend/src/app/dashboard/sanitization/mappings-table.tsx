/**
 * @module app/dashboard/sanitization/mappings-table
 * Module implementation for mappings-table.tsx.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import {
  deleteMapping,
  toggleMappingActive,
} from '@/features/sanitization/actions/sanitization-actions';
import type { JobTitleMapping } from '@/features/sanitization/types/sanitization.types';
import { EditMappingDialog } from './edit-mapping-dialog';

interface MappingsTableProps {
  mappings: JobTitleMapping[];
}

/**
 * Executes MappingsTable.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function MappingsTable({ mappings }: MappingsTableProps) {
  const [editingMapping, setEditingMapping] = useState<JobTitleMapping | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    setIsDeleting(id);
    await deleteMapping(id);
    setIsDeleting(null);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setIsToggling(id);
    await toggleMappingActive(id, !currentActive);
    setIsToggling(null);
  };

  if (mappings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No mappings yet. Add your first job title mapping to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Internal Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Public Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Job Family
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Level
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {mappings.map((mapping) => (
              <tr key={mapping.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {mapping.internal_code}
                  </code>
                  {mapping.aliases.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      +{mapping.aliases.length} alias
                      {mapping.aliases.length > 1 ? 'es' : ''}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {mapping.public_title}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {mapping.job_family || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {mapping.level_indicator || '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      handleToggleActive(mapping.id, mapping.is_active)
                    }
                    disabled={isToggling === mapping.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      mapping.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mapping.is_active ? (
                      <>
                        <Check className="h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMapping(mapping)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(mapping.id)}
                      disabled={isDeleting === mapping.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingMapping && (
        <EditMappingDialog
          mapping={editingMapping}
          open={!!editingMapping}
          onClose={() => setEditingMapping(null)}
        />
      )}
    </>
  );
}
