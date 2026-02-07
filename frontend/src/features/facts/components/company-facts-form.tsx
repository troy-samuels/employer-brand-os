'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  companyFactsSchema,
  type CompanyFactsFormData,
  BENEFIT_OPTIONS,
  CURRENCY_OPTIONS,
  REMOTE_POLICY_OPTIONS,
} from '@/features/facts/schemas/facts.schema';
import { saveCompanyFacts } from '@/features/facts/actions/save-facts';

interface CompanyFactsFormProps {
  defaultValues: CompanyFactsFormData | null;
}

export function CompanyFactsForm({ defaultValues }: CompanyFactsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<CompanyFactsFormData>({
    resolver: zodResolver(companyFactsSchema),
    defaultValues: defaultValues || {
      companyName: '',
      description: '',
      salaryMin: 0,
      salaryMax: 0,
      currency: 'USD',
      benefits: [],
      remotePolicy: 'hybrid',
    },
  });

  async function onSubmit(data: CompanyFactsFormData) {
    setIsSaving(true);
    setSaveStatus('idle');

    const result = await saveCompanyFacts(data);

    setIsSaving(false);

    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your company..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
              Compensation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="80000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Benefits & Policy */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
              Benefits & Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="benefits"
              render={() => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {BENEFIT_OPTIONS.map((benefit) => (
                      <FormField
                        key={benefit.id}
                        control={form.control}
                        name="benefits"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(benefit.label)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, benefit.label]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== benefit.label)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal normal-case tracking-normal text-muted-foreground">
                              {benefit.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remotePolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remote Policy</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full sm:w-[240px]">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REMOTE_POLICY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {saveStatus === 'success' && (
            <span className="text-sm text-success">Changes saved successfully</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-destructive">Failed to save changes</span>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
