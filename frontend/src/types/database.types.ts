/**
 * @module types/database.types
 * Generated and augmented Supabase database model types.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Defines the Database contract.
 */
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_mentions: {
        Row: {
          accuracy_score: number | null
          analyzed_at: string | null
          detected_at: string | null
          has_inaccuracies: boolean | null
          id: string
          organization_id: string | null
          query: string | null
          response_text: string
          sentiment: string | null
          source: string
          source_model: string | null
          topics: Json | null
        }
        Insert: {
          accuracy_score?: number | null
          analyzed_at?: string | null
          detected_at?: string | null
          has_inaccuracies?: boolean | null
          id?: string
          organization_id?: string | null
          query?: string | null
          response_text: string
          sentiment?: string | null
          source: string
          source_model?: string | null
          topics?: Json | null
        }
        Update: {
          accuracy_score?: number | null
          analyzed_at?: string | null
          detected_at?: string | null
          has_inaccuracies?: boolean | null
          id?: string
          organization_id?: string | null
          query?: string | null
          response_text?: string
          sentiment?: string | null
          source?: string
          source_model?: string | null
          topics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          key_version: number | null
          last_used_at: string | null
          name: string | null
          organization_id: string | null
          rate_limit_per_minute: number | null
          scopes: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          key_version?: number | null
          last_used_at?: string | null
          name?: string | null
          organization_id?: string | null
          rate_limit_per_minute?: number | null
          scopes?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          key_version?: number | null
          last_used_at?: string | null
          name?: string | null
          organization_id?: string | null
          rate_limit_per_minute?: number | null
          scopes?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          actor: string | null
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          record_id: string | null
          resource: string | null
          result: string | null
          table_name: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actor?: string | null
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          record_id?: string | null
          resource?: string | null
          result?: string | null
          table_name: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actor?: string | null
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          record_id?: string | null
          resource?: string | null
          result?: string | null
          table_name?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_leads: {
        Row: {
          company_slug: string | null
          created_at: string | null
          email: string
          email_domain: string
          id: string
          score: number | null
        }
        Insert: {
          company_slug?: string | null
          created_at?: string | null
          email: string
          email_domain: string
          id?: string
          score?: number | null
        }
        Update: {
          company_slug?: string | null
          created_at?: string | null
          email?: string
          email_domain?: string
          id?: string
          score?: number | null
        }
        Relationships: []
      }
      compliance_checks: {
        Row: {
          check_type: string
          checked_at: string | null
          details: Json | null
          fact_ids: string[] | null
          id: string
          is_compliant: boolean
          jurisdiction: string
          location_id: string | null
          organization_id: string | null
        }
        Insert: {
          check_type: string
          checked_at?: string | null
          details?: Json | null
          fact_ids?: string[] | null
          id?: string
          is_compliant: boolean
          jurisdiction: string
          location_id?: string | null
          organization_id?: string | null
        }
        Update: {
          check_type?: string
          checked_at?: string | null
          details?: Json | null
          fact_ids?: string[] | null
          id?: string
          is_compliant?: boolean
          jurisdiction?: string
          location_id?: string | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_facts: {
        Row: {
          compliance_tags: Json | null
          created_at: string | null
          created_by: string | null
          definition_id: string | null
          effective_date: string | null
          effective_end_date: string | null
          id: string
          include_in_jsonld: boolean | null
          is_current: boolean | null
          job_roles: Json | null
          location_id: string | null
          organization_id: string | null
          updated_at: string | null
          updated_by: string | null
          value: Json
          verification_source: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          version: number | null
        }
        Insert: {
          compliance_tags?: Json | null
          created_at?: string | null
          created_by?: string | null
          definition_id?: string | null
          effective_date?: string | null
          effective_end_date?: string | null
          id?: string
          include_in_jsonld?: boolean | null
          is_current?: boolean | null
          job_roles?: Json | null
          location_id?: string | null
          organization_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value: Json
          verification_source?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version?: number | null
        }
        Update: {
          compliance_tags?: Json | null
          created_at?: string | null
          created_by?: string | null
          definition_id?: string | null
          effective_date?: string | null
          effective_end_date?: string | null
          id?: string
          include_in_jsonld?: boolean | null
          is_current?: boolean | null
          job_roles?: Json | null
          location_id?: string | null
          organization_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
          verification_source?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_facts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_facts_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "fact_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_facts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_facts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_facts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_facts_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      fact_definitions: {
        Row: {
          category_id: string | null
          created_at: string | null
          data_type: string
          description: string | null
          display_name: string
          id: string
          include_in_jsonld: boolean | null
          is_public: boolean | null
          is_required: boolean | null
          is_salary_data: boolean | null
          name: string
          organization_id: string | null
          requires_job_role: boolean | null
          requires_location: boolean | null
          schema_property: string | null
          schema_type: string | null
          sort_order: number | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          data_type?: string
          description?: string | null
          display_name: string
          id?: string
          include_in_jsonld?: boolean | null
          is_public?: boolean | null
          is_required?: boolean | null
          is_salary_data?: boolean | null
          name: string
          organization_id?: string | null
          requires_job_role?: boolean | null
          requires_location?: boolean | null
          schema_property?: string | null
          schema_type?: string | null
          sort_order?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          data_type?: string
          description?: string | null
          display_name?: string
          id?: string
          include_in_jsonld?: boolean | null
          is_public?: boolean | null
          is_required?: boolean | null
          is_salary_data?: boolean | null
          name?: string
          organization_id?: string | null
          requires_job_role?: boolean | null
          requires_location?: boolean | null
          schema_property?: string | null
          schema_type?: string | null
          sort_order?: number | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_definitions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fact_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_versions: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          fact_id: string | null
          id: string
          job_roles: Json | null
          value: Json
          verification_status: string | null
          version: number
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          fact_id?: string | null
          id?: string
          job_roles?: Json | null
          value: Json
          verification_status?: string | null
          version: number
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          fact_id?: string | null
          id?: string
          job_roles?: Json | null
          value?: Json
          verification_status?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fact_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_versions_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "employer_facts"
            referencedColumns: ["id"]
          },
        ]
      }
      hallucination_flags: {
        Row: {
          auto_resolved_at: string | null
          claim: string
          correct_value: string | null
          estimated_impact: number | null
          fact_id: string | null
          flagged_at: string | null
          id: string
          mention_id: string | null
          organization_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          source_date: string | null
          source_origin: string | null
          status: string | null
        }
        Insert: {
          auto_resolved_at?: string | null
          claim: string
          correct_value?: string | null
          estimated_impact?: number | null
          fact_id?: string | null
          flagged_at?: string | null
          id?: string
          mention_id?: string | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          source_date?: string | null
          source_origin?: string | null
          status?: string | null
        }
        Update: {
          auto_resolved_at?: string | null
          claim?: string
          correct_value?: string | null
          estimated_impact?: number | null
          fact_id?: string | null
          flagged_at?: string | null
          id?: string
          mention_id?: string | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          source_date?: string | null
          source_origin?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hallucination_flags_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "employer_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hallucination_flags_mention_id_fkey"
            columns: ["mention_id"]
            isOneToOne: false
            referencedRelation: "ai_mentions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hallucination_flags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hallucination_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hosted_pages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          last_viewed_at: string | null
          logo_url: string | null
          organization_id: string | null
          slug: string
          theme: Json | null
          title: string | null
          updated_at: string | null
          view_count: number | null
          visible_categories: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          last_viewed_at?: string | null
          logo_url?: string | null
          organization_id?: string | null
          slug: string
          theme?: Json | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
          visible_categories?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          last_viewed_at?: string | null
          logo_url?: string | null
          organization_id?: string | null
          slug?: string
          theme?: Json | null
          title?: string | null
          updated_at?: string | null
          view_count?: number | null
          visible_categories?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "hosted_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      jsonld_exports: {
        Row: {
          content_hash: string | null
          created_at: string | null
          fact_ids: string[] | null
          id: string
          jsonld_payload: Json
          organization_id: string | null
          page_url: string | null
          schema_type: string | null
          schema_version: string | null
          served_to: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string | null
          fact_ids?: string[] | null
          id?: string
          jsonld_payload: Json
          organization_id?: string | null
          page_url?: string | null
          schema_type?: string | null
          schema_version?: string | null
          served_to?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string | null
          fact_ids?: string[] | null
          id?: string
          jsonld_payload?: Json
          organization_id?: string | null
          page_url?: string | null
          schema_type?: string | null
          schema_version?: string | null
          served_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jsonld_exports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_title_mappings: {
        Row: {
          aliases: string[] | null
          created_at: string | null
          created_by: string | null
          id: string
          internal_code: string
          is_active: boolean | null
          job_family: string | null
          level_indicator: string | null
          location_id: string | null
          organization_id: string | null
          public_title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          aliases?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          internal_code: string
          is_active?: boolean | null
          job_family?: string | null
          level_indicator?: string | null
          location_id?: string | null
          organization_id?: string | null
          public_title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          aliases?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          internal_code?: string
          is_active?: boolean | null
          job_family?: string | null
          level_indicator?: string | null
          location_id?: string | null
          organization_id?: string | null
          public_title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_title_mappings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_title_mappings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_title_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_title_mappings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          audit_result: Json | null
          audit_status: string | null
          company_name: string | null
          contact_email: string | null
          contact_mobile: string | null
          contact_phone: string | null
          contact_title: string | null
          created_at: string | null
          first_name: string | null
          id: string
          import_batch: string | null
          last_contacted_at: string | null
          last_name: string | null
          notes: string | null
          salutation: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          audit_result?: Json | null
          audit_status?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_mobile?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          import_batch?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          notes?: string | null
          salutation?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          audit_result?: Json | null
          audit_status?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_mobile?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          import_batch?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          notes?: string | null
          salutation?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          address_line1: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_headquarters: boolean | null
          location_type: string | null
          name: string
          organization_id: string | null
          pay_transparency_jurisdiction: string | null
          postal_code: string | null
          settings: Json | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_headquarters?: boolean | null
          location_type?: string | null
          name: string
          organization_id?: string | null
          pay_transparency_jurisdiction?: string | null
          postal_code?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_headquarters?: boolean | null
          location_type?: string | null
          name?: string
          organization_id?: string | null
          pay_transparency_jurisdiction?: string | null
          postal_code?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          employee_count: number | null
          glassdoor_rating: number | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          tier: string | null
          trust_score: number | null
          trust_score_updated_at: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          employee_count?: number | null
          glassdoor_rating?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          tier?: string | null
          trust_score?: number | null
          trust_score_updated_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          employee_count?: number | null
          glassdoor_rating?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          tier?: string | null
          trust_score?: number | null
          trust_score_updated_at?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      pixel_events: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          error_message: string | null
          event_type: string
          facts_returned: number | null
          id: string
          ip_address: unknown
          organization_id: string | null
          page_url: string | null
          referer: string | null
          response_time_ms: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          facts_returned?: number | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          page_url?: string | null
          referer?: string | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          facts_returned?: number | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          page_url?: string | null
          referer?: string | null
          response_time_ms?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pixel_events_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pixel_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bucket_key: string
          count: number
          created_at: string | null
          expires_at: string
          id: string
          updated_at: string | null
        }
        Insert: {
          bucket_key: string
          count?: number
          created_at?: string | null
          expires_at: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          bucket_key?: string
          count?: number
          created_at?: string | null
          expires_at?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_location_access: {
        Row: {
          can_edit_facts: boolean | null
          can_verify_facts: boolean | null
          can_view_facts: boolean | null
          granted_at: string | null
          granted_by: string | null
          id: string
          location_id: string | null
          user_id: string | null
        }
        Insert: {
          can_edit_facts?: boolean | null
          can_verify_facts?: boolean | null
          can_view_facts?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          location_id?: string | null
          user_id?: string | null
        }
        Update: {
          can_edit_facts?: boolean | null
          can_verify_facts?: boolean | null
          can_view_facts?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          location_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_location_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_location_access_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_location_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          organization_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_jsonld: { Args: { org_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

/**
 * Defines the Tables contract.
 */
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

/**
 * Defines the TablesInsert contract.
 */
export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

/**
 * Defines the TablesUpdate contract.
 */
export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

/**
 * Defines the Enums contract.
 */
export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

/**
 * Defines the CompositeTypes contract.
 */
export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

/**
 * Exposes exported value(s): Constants.
 */
export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
