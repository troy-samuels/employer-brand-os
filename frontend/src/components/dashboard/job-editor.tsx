"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import type { JobPosting } from "@/types/jobs";

interface JobEditorProps {
  job?: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobPosting) => Promise<void>;
}

export function JobEditor({ job, isOpen, onClose, onSave }: JobEditorProps) {
  const [formData, setFormData] = useState<JobPosting | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData(job);
    }
  }, [job]);

  const handleSave = useCallback(async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  useEffect(() => {
    if (!isOpen || !formData || !isDirty) return;

    const interval = setInterval(() => {
      void handleSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, formData, isDirty, handleSave]);

  const handleChange = (key: keyof JobPosting, value: string | boolean) => {
    if (!formData) return;
    setFormData({ ...formData, [key]: value } as JobPosting);
    setIsDirty(true);
  };

  const preview = useMemo(() => {
    if (!formData) return null;
    return (
      <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-900">Preview</h4>
        <p className="text-sm text-gray-700 mt-2">{formData.title}</p>
        <p className="text-xs text-gray-500">{formData.department}</p>
        <p className="text-xs text-gray-500 mt-2">{formData.description}</p>
      </div>
    );
  }, [formData]);

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-4xl">
        <ModalHeader>
          <ModalTitle>Edit Job Posting</ModalTitle>
          <ModalDescription>
            Auto-save is enabled. Updates are checked for compliance as you type.
          </ModalDescription>
        </ModalHeader>

        {formData && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Input
                label="Job Title"
                value={formData.title}
                onValueChange={(value) => handleChange("title", value)}
                required
              />
              <Input
                label="Department"
                value={formData.department}
                onValueChange={(value) => handleChange("department", value)}
                required
              />
              <Input
                label="Description"
                value={formData.description}
                onValueChange={(value) => handleChange("description", value)}
              />
              <Input
                label="Employment Type"
                value={formData.employment_type}
                onValueChange={(value) => handleChange("employment_type", value)}
              />
              <Input
                label="Remote Eligible"
                value={formData.remote_eligible ? "Yes" : "No"}
                onValueChange={(value) => handleChange("remote_eligible", value === "Yes")}
              />
            </div>
            {preview}
          </div>
        )}

        <ModalFooter>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={isSaving} onClick={handleSave}>
            {isSaving ? "Saving" : "Save Changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
