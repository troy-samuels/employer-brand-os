/**
 * @module components/dashboard/job-table
 * Module implementation for job-table.tsx.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JobPosting } from "@/types/jobs";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";

interface JobTableProps {
  jobs: JobPosting[];
  onEdit: (job: JobPosting) => void;
  onDelete: (jobId: string) => void;
  onToggleStatus: (jobId: string, status: JobPosting["status"]) => void;
}

/**
 * Executes JobTable.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function JobTable({ jobs, onEdit, onDelete, onToggleStatus }: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500">
        No job postings yet. Create your first role to start tracking AI visibility.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Title</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Posted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{job.title}</span>
                {job.salary_range && (
                  <span className="text-xs text-gray-500">
                    {formatCurrency(job.salary_range.min, job.salary_range.max, job.salary_range.currency)}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>{job.department}</TableCell>
            <TableCell>{job.location?.city ?? "Remote"}</TableCell>
            <TableCell>{job.employment_type}</TableCell>
            <TableCell>{formatDate(job.posted_date)}</TableCell>
            <TableCell>
              <Badge
                variant={
                  job.status === "active"
                    ? "success"
                    : job.status === "paused"
                      ? "warning"
                      : "neutral"
                }
              >
                {job.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(job)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onToggleStatus(job.id, job.status === "active" ? "paused" : "active")
                  }
                >
                  {job.status === "active" ? "Pause" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(job.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
