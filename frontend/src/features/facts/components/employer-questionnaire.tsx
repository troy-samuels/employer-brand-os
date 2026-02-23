/**
 * @module features/facts/components/employer-questionnaire
 * Comprehensive employer facts questionnaire with multi-section form
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Loader2, Plus, Trash2, Check, ChevronRight, 
  DollarSign, Gift, Briefcase, Code, Users, 
  Target, TrendingUp, Heart, Save, Upload
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import {
  employerFactsSchema,
  type EmployerFactsFormData,
  CURRENCY_OPTIONS,
  REMOTE_POLICY_OPTIONS,
  PAY_REVIEW_OPTIONS,
} from '../schemas/employer-facts.schema';
import { BENEFIT_CATEGORIES, QUICK_ADD_BENEFITS, TECH_CATEGORIES } from '../types/employer-facts.types';
import {
  WorkPolicySection,
  TechStackSection,
  InterviewSection,
  CultureSection,
  DEISection,
  CareerGrowthSection,
  LeaveSection,
} from './questionnaire-sections';

interface EmployerQuestionnaireProps {
  defaultValues: EmployerFactsFormData | null;
  companySlug: string;
  companyName: string;
}

type Section = 
  | 'compensation'
  | 'benefits'
  | 'work-policy'
  | 'tech-stack'
  | 'interview'
  | 'culture'
  | 'dei'
  | 'career-growth'
  | 'leave';

const SECTIONS: { id: Section; label: string; icon: typeof DollarSign }[] = [
  { id: 'compensation', label: 'Salary & Compensation', icon: DollarSign },
  { id: 'benefits', label: 'Benefits', icon: Gift },
  { id: 'work-policy', label: 'Work Policy', icon: Briefcase },
  { id: 'tech-stack', label: 'Tech Stack', icon: Code },
  { id: 'interview', label: 'Interview Process', icon: Users },
  { id: 'culture', label: 'Culture & Values', icon: Target },
  { id: 'dei', label: 'Diversity & Inclusion', icon: Heart },
  { id: 'career-growth', label: 'Career Growth', icon: TrendingUp },
  { id: 'leave', label: 'Leave & Time Off', icon: Heart },
];

/**
 * Main employer questionnaire component with auto-save and progress tracking
 */
export function EmployerQuestionnaire({ defaultValues, companySlug, companyName }: EmployerQuestionnaireProps) {
  const [currentSection, setCurrentSection] = useState<Section>('compensation');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const form = useForm<EmployerFactsFormData>({
    resolver: zodResolver(employerFactsSchema),
    defaultValues: defaultValues || {
      company_slug: companySlug,
      company_name: companyName,
      salary_bands: [],
      benefits: [],
      office_locations: [],
      tech_stack: [],
      interview_stages: [],
      company_values: [],
      dei_initiatives: [],
      career_levels: [],
      flexible_hours: false,
      published: false,
    },
  });

  // Field arrays for dynamic lists
  const salaryBands = useFieldArray({ control: form.control, name: 'salary_bands' });
  const benefits = useFieldArray({ control: form.control, name: 'benefits' });
  const officeLocations = useFieldArray({ control: form.control, name: 'office_locations' });
  const techStack = useFieldArray({ control: form.control, name: 'tech_stack' });
  const interviewStages = useFieldArray({ control: form.control, name: 'interview_stages' });
  const companyValues = useFieldArray({ control: form.control, name: 'company_values' });
  const deiInitiatives = useFieldArray({ control: form.control, name: 'dei_initiatives' });
  const careerLevels = useFieldArray({ control: form.control, name: 'career_levels' });

  // Auto-save debounced
  useEffect(() => {
    const subscription = form.watch(() => {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleAutoSave = useCallback(async () => {
    const data = form.getValues();
    await saveDraft(data);
  }, [form]);

  async function saveDraft(data: EmployerFactsFormData) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/employer-facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, published: false }),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }

  async function onSubmit(data: EmployerFactsFormData) {
    await saveDraft(data);
  }

  async function handlePublish() {
    setIsPublishing(true);
    const data = form.getValues();
    
    try {
      const response = await fetch('/api/employer-facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, published: true }),
      });

      if (!response.ok) throw new Error('Failed to publish');
      
      setShowPublishDialog(false);
      form.setValue('published', true);
    } catch (error) {
      console.error('Publish failed:', error);
    } finally {
      setIsPublishing(false);
    }
  }

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    const data = form.getValues();
    let filled = 0;
    let total = 0;

    // Count filled fields across all sections
    const checkArray = (arr: any[] | undefined) => arr && arr.length > 0;
    const checkString = (str: string | undefined) => str && str.length > 0;

    // Compensation (3 fields)
    total += 3;
    if (checkArray(data.salary_bands)) filled++;
    if (checkString(data.bonus_structure)) filled++;
    if (checkString(data.pay_review_cycle)) filled++;

    // Benefits (3 fields)
    total += 3;
    if (checkArray(data.benefits)) filled++;
    if (checkString(data.pension_contribution)) filled++;
    if (checkString(data.healthcare)) filled++;

    // Work Policy (4 fields)
    total += 4;
    if (checkString(data.remote_policy)) filled++;
    if (checkString(data.remote_details)) filled++;
    if (checkArray(data.office_locations)) filled++;
    if (data.flexible_hours || checkString(data.flexible_hours_details)) filled++;

    // Tech Stack (2 fields)
    total += 2;
    if (checkArray(data.tech_stack)) filled++;
    if (checkString(data.engineering_blog_url)) filled++;

    // Interview (2 fields)
    total += 2;
    if (checkArray(data.interview_stages)) filled++;
    if (checkString(data.interview_timeline)) filled++;

    // Culture (4 fields)
    total += 4;
    if (checkArray(data.company_values)) filled++;
    if (checkString(data.culture_description)) filled++;
    if (checkString(data.team_size)) filled++;
    if (data.founded_year) filled++;

    // DEI (3 fields)
    total += 3;
    if (checkString(data.dei_statement)) filled++;
    if (checkArray(data.dei_initiatives)) filled++;
    if (checkString(data.gender_pay_gap_url)) filled++;

    // Career Growth (3 fields)
    total += 3;
    if (checkString(data.promotion_framework)) filled++;
    if (checkString(data.learning_budget)) filled++;
    if (checkArray(data.career_levels)) filled++;

    // Leave (4 fields)
    total += 4;
    if (checkString(data.maternity_leave)) filled++;
    if (checkString(data.paternity_leave)) filled++;
    if (checkString(data.parental_leave_details)) filled++;
    if (checkString(data.annual_leave)) filled++;

    return Math.round((filled / total) * 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* Sidebar Navigation */}
      <aside className="space-y-2">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{completion}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = currentSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{section.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
            </button>
          );
        })}

        <div className="pt-6 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {!isSaving && lastSaved && (
              <>
                <Check className="h-3 w-3 text-success" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Form Content */}
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Section 1: Compensation */}
            {currentSection === 'compensation' && (
              <Card>
                <CardHeader>
                  <CardTitle>Salary & Compensation</CardTitle>
                  <CardDescription>
                    Add salary ranges for your roles. This data helps AI models provide accurate compensation information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Salary Bands */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Salary Bands</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => salaryBands.append({ 
                          role: '', 
                          min: 0, 
                          max: 0, 
                          currency: 'GBP', 
                          equity: false 
                        })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Role
                      </Button>
                    </div>

                    {salaryBands.fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <FormField
                            control={form.control}
                            name={`salary_bands.${index}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                  <Input placeholder="Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`salary_bands.${index}.min`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Salary</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="45000" 
                                    {...field}
                                    onChange={e => field.onChange(+e.target.value)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`salary_bands.${index}.max`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Salary</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="65000" 
                                    {...field}
                                    onChange={e => field.onChange(+e.target.value)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`salary_bands.${index}.currency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {CURRENCY_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <FormField
                            control={form.control}
                            name={`salary_bands.${index}.equity`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Includes equity/stock options
                                </FormLabel>
                              </FormItem>
                            )}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => salaryBands.remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bonus Structure */}
                  <FormField
                    control={form.control}
                    name="bonus_structure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus Structure</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="E.g., Annual performance bonus up to 15%, quarterly team bonuses..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe your bonus, commission, or incentive structure
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pay Review Cycle */}
                  <FormField
                    control={form.control}
                    name="pay_review_cycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pay Review Cycle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full sm:w-[280px]">
                              <SelectValue placeholder="Select review cycle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAY_REVIEW_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often do you review and adjust salaries?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Section 2: Benefits */}
            {currentSection === 'benefits' && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>
                    List the benefits you offer. Quick-add common benefits or create custom ones.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Add Benefits */}
                  <div className="space-y-3">
                    <FormLabel>Quick Add Common Benefits</FormLabel>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {QUICK_ADD_BENEFITS.map((benefit) => (
                        <Button
                          key={benefit}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const exists = benefits.fields.some(
                              (f) => (f as any).name === benefit
                            );
                            if (!exists) {
                              benefits.append({
                                category: 'Healthcare',
                                name: benefit,
                                details: '',
                              });
                            }
                          }}
                          className="justify-start"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {benefit}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Benefits */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Custom Benefits</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => benefits.append({ 
                          category: 'Healthcare', 
                          name: '', 
                          details: '' 
                        })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom
                      </Button>
                    </div>

                    {benefits.fields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`benefits.${index}.category`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {BENEFIT_CATEGORIES.map(cat => (
                                      <SelectItem key={cat} value={cat}>
                                        {cat}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`benefits.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Benefit name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`benefits.${index}.details`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Details (optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Additional details about this benefit..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => benefits.remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pension & Healthcare */}
                  <FormField
                    control={form.control}
                    name="pension_contribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pension Contribution</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., 5% employer contribution + match up to 5%"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="healthcare"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Healthcare Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your healthcare coverage..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Section 3: Work Policy */}
            {currentSection === 'work-policy' && (
              <WorkPolicySection form={form} officeLocations={officeLocations} />
            )}

            {/* Section 4: Tech Stack */}
            {currentSection === 'tech-stack' && (
              <TechStackSection form={form} techStack={techStack} />
            )}

            {/* Section 5: Interview Process */}
            {currentSection === 'interview' && (
              <InterviewSection form={form} interviewStages={interviewStages} />
            )}

            {/* Section 6: Culture & Values */}
            {currentSection === 'culture' && (
              <CultureSection form={form} companyValues={companyValues} />
            )}

            {/* Section 7: Diversity & Inclusion */}
            {currentSection === 'dei' && (
              <DEISection form={form} deiInitiatives={deiInitiatives} />
            )}

            {/* Section 8: Career Growth */}
            {currentSection === 'career-growth' && (
              <CareerGrowthSection form={form} careerLevels={careerLevels} />
            )}

            {/* Section 9: Leave & Time Off */}
            {currentSection === 'leave' && (
              <LeaveSection form={form} />
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const data = form.getValues();
                  saveDraft(data);
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>

              <Button
                type="button"
                onClick={() => setShowPublishDialog(true)}
                disabled={completion < 50}
              >
                <Upload className="h-4 w-4 mr-2" />
                Publish Facts
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Employer Facts?</DialogTitle>
            <DialogDescription>
              This will make your company information publicly available and generate AEO content
              for AI models. You can unpublish at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
