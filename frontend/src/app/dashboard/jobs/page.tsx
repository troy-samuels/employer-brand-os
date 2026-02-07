"use client";

import { useEffect, useState } from "react";

import { JobEditor } from "@/components/dashboard/job-editor";
import { JobTable } from "@/components/dashboard/job-table";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { toast } from "@/components/ui/sonner";
import { useJobs } from "@/lib/hooks/use-jobs";
import type { JobPosting } from "@/types/jobs";

export default function JobsPage() {
  const { jobs: fetchedJobs, isLoading } = useJobs();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    setJobs(fetchedJobs);
  }, [fetchedJobs]);

  const handleEdit = (job: JobPosting) => {
    setSelectedJob(job);
    setEditorOpen(true);
  };

  const handleSave = async (job: JobPosting) => {
    try {
      setJobs((prev) => prev.map((item) => (item.id === job.id ? job : item)));
      toast.success("Job updated", {
        description: `${job.title} has been saved.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save job";
      toast.error("Save failed", { description: message });
    }
  };

  const handleDelete = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    toast.success("Job removed");
  };

  const handleToggleStatus = (jobId: string, status: JobPosting["status"]) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status } : job))
    );
  };

  if (isLoading) {
    return <Loading label="Loading job postings" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Job Postings</h2>
          <p className="text-sm text-gray-500">
            Manage roles and keep AI visibility data accurate.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => jobs[0] && handleEdit(jobs[0])}
          disabled={!jobs[0]}
        >
          Edit Latest Job
        </Button>
      </div>

      <JobTable
        jobs={jobs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <JobEditor
        job={selectedJob}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
