/**
 * @module features/facts/components/questionnaire-sections
 * Additional form sections for the employer questionnaire (work policy, tech, interview, culture, DEI, career, leave)
 * Import and use these in employer-questionnaire.tsx
 */

'use client';

import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
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

import { EmployerFactsFormData, REMOTE_POLICY_OPTIONS } from '../schemas/employer-facts.schema';
import { TECH_CATEGORIES } from '../types/employer-facts.types';

interface SectionProps {
  form: UseFormReturn<EmployerFactsFormData>;
  officeLocations?: UseFieldArrayReturn<EmployerFactsFormData, 'office_locations', 'id'>;
  techStack?: UseFieldArrayReturn<EmployerFactsFormData, 'tech_stack', 'id'>;
  interviewStages?: UseFieldArrayReturn<EmployerFactsFormData, 'interview_stages', 'id'>;
  companyValues?: UseFieldArrayReturn<EmployerFactsFormData, 'company_values', 'id'>;
  deiInitiatives?: UseFieldArrayReturn<EmployerFactsFormData, 'dei_initiatives', 'id'>;
  careerLevels?: UseFieldArrayReturn<EmployerFactsFormData, 'career_levels', 'id'>;
}

export function WorkPolicySection({ form, officeLocations }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Policy</CardTitle>
        <CardDescription>
          Define your remote work policy and office locations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Remote Policy */}
        <FormField
          control={form.control}
          name="remote_policy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remote Policy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REMOTE_POLICY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remote Details */}
        <FormField
          control={form.control}
          name="remote_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remote Policy Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="E.g., 3 days in office, 2 days remote. Core hours 10am-4pm."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide specifics about your work arrangement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Office Locations */}
        {officeLocations && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Office Locations</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => officeLocations.append({ city: '', country: '', address: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            {officeLocations.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`office_locations.${index}.city`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="London" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`office_locations.${index}.country`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United Kingdom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`office_locations.${index}.address`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Tech Street" {...field} />
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
                    onClick={() => officeLocations.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flexible Hours */}
        <FormField
          control={form.control}
          name="flexible_hours"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Flexible working hours available
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="flexible_hours_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flexible Hours Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your flexible hours policy..."
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
  );
}

export function TechStackSection({ form, techStack }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tech Stack</CardTitle>
        <CardDescription>
          Share your technology stack (only show this if you have engineering roles).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {techStack && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Technology Categories</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => techStack.append({ category: 'Frontend', tools: [] })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            {techStack.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <FormField
                  control={form.control}
                  name={`tech_stack.${index}.category`}
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
                          {TECH_CATEGORIES.map(cat => (
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
                  name={`tech_stack.${index}.tools`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tools/Technologies</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="React, TypeScript, Next.js (comma separated)"
                          value={field.value?.join(', ') || ''}
                          onChange={(e) => {
                            const tools = e.target.value
                              .split(',')
                              .map(t => t.trim())
                              .filter(t => t.length > 0);
                            field.onChange(tools);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter tools separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => techStack.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="engineering_blog_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engineering Blog URL</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://engineering.yourcompany.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Link to your technical blog or engineering content
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function InterviewSection({ form, interviewStages }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Process</CardTitle>
        <CardDescription>
          Outline your interview stages and timeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {interviewStages && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Interview Stages</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => interviewStages.append({ stage: '', description: '', duration: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
            </div>

            {interviewStages.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`interview_stages.${index}.stage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Technical Interview" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`interview_stages.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="1 hour" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`interview_stages.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What happens in this stage..."
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
                    onClick={() => interviewStages.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="interview_timeline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Timeline</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., 2-3 weeks typical"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                How long does your full interview process typically take?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function CultureSection({ form, companyValues }: SectionProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Culture & Values</CardTitle>
        <CardDescription>
          Share your company culture, values, and team information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {companyValues && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Company Values</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => companyValues.append({ value: '', description: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Value
              </Button>
            </div>

            {companyValues.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <FormField
                  control={form.control}
                  name={`company_values.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer First" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`company_values.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What this value means to us..."
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
                    onClick={() => companyValues.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="culture_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Culture Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your company culture in detail..."
                  className="min-h-[150px]"
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Max 500 characters. {field.value?.length || 0}/500
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="team_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Size</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., 50-100 employees" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="founded_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Founded Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder={String(currentYear)}
                    min={1800}
                    max={currentYear}
                    {...field}
                    onChange={e => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DEISection({ form, deiInitiatives }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diversity & Inclusion</CardTitle>
        <CardDescription>
          Share your DEI commitments and initiatives.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="dei_statement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DEI Statement</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Your diversity, equity, and inclusion statement..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {deiInitiatives && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>DEI Initiatives</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => deiInitiatives.append({ name: '', description: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Initiative
              </Button>
            </div>

            {deiInitiatives.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <FormField
                  control={form.control}
                  name={`dei_initiatives.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initiative Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Women in Tech Program" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`dei_initiatives.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Details about this initiative..."
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
                    onClick={() => deiInitiatives.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="gender_pay_gap_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender Pay Gap Report URL</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://yourcompany.com/pay-gap-report"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Link to your published gender pay gap report (if applicable)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function CareerGrowthSection({ form, careerLevels }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Growth</CardTitle>
        <CardDescription>
          Outline your promotion framework and learning opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="promotion_framework"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotion Framework</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe how promotions work at your company..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="learning_budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learning & Development Budget</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., £1,500/year per person"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Annual budget for courses, conferences, books, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {careerLevels && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Career Levels</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => careerLevels.append({ level: '', title: '', description: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </div>

            {careerLevels.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`career_levels.${index}.level`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., IC3, Senior" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`career_levels.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`career_levels.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Key responsibilities and expectations..."
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
                    onClick={() => careerLevels.remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LeaveSection({ form }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave & Time Off</CardTitle>
        <CardDescription>
          Detail your parental leave and annual leave policies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="maternity_leave"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maternity Leave</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., 6 months full pay"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paternity_leave"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paternity Leave</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., 4 weeks full pay"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parental_leave_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Parental Leave Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional parental leave policies..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="annual_leave"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Leave</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., 25 days + bank holidays"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include any additional details about holiday allowance
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
