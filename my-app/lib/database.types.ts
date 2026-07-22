// AUTO-GENERATED from the live Supabase schema. Do not edit by hand.
// Regenerate after schema changes (see context/CLAUDE.md workflow).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      absence_reports: {
        Row: {
          absence_date: string
          created_at: string
          id: string
          proof_url: string | null
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["absence_report_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          absence_date: string
          created_at?: string
          id?: string
          proof_url?: string | null
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["absence_report_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          absence_date?: string
          created_at?: string
          id?: string
          proof_url?: string | null
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["absence_report_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "absence_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absence_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "absence_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["user_role"] | null
          created_at: string
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          status: Database["public"]["Enums"]["log_status"]
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          status?: Database["public"]["Enums"]["log_status"]
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          status?: Database["public"]["Enums"]["log_status"]
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          attendance_date: string
          class_id: string | null
          code_used: string | null
          created_at: string
          device: string | null
          excuse: Database["public"]["Enums"]["excuse_status"]
          excused_at: string | null
          excused_by: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          marked_at: string
          marked_by: string | null
          method: Database["public"]["Enums"]["attendance_method"]
          notes: string | null
          photo_url: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          class_id?: string | null
          code_used?: string | null
          created_at?: string
          device?: string | null
          excuse?: Database["public"]["Enums"]["excuse_status"]
          excused_at?: string | null
          excused_by?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          marked_at?: string
          marked_by?: string | null
          method?: Database["public"]["Enums"]["attendance_method"]
          notes?: string | null
          photo_url?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          class_id?: string | null
          code_used?: string | null
          created_at?: string
          device?: string | null
          excuse?: Database["public"]["Enums"]["excuse_status"]
          excused_at?: string | null
          excused_by?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          marked_at?: string
          marked_by?: string | null
          method?: Database["public"]["Enums"]["attendance_method"]
          notes?: string | null
          photo_url?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_excused_by_fkey"
            columns: ["excused_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          active: boolean
          features: string[]
          id: string
          name: string
          price_monthly: number
        }
        Insert: {
          active?: boolean
          features?: string[]
          id?: string
          name: string
          price_monthly: number
        }
        Update: {
          active?: boolean
          features?: string[]
          id?: string
          name?: string
          price_monthly?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          published_at: string | null
          slug: string | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_schedules: {
        Row: {
          active: boolean
          class_id: string
          day_of_week: number | null
          end_time: string
          id: string
          location: string | null
          start_time: string
        }
        Insert: {
          active?: boolean
          class_id: string
          day_of_week?: number | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
        }
        Update: {
          active?: boolean
          class_id?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          class_id: string
          created_at: string
          end_at: string
          id: string
          location: string | null
          mentor_id: string | null
          session_date: string
          start_at: string
          status: Database["public"]["Enums"]["session_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          end_at: string
          id?: string
          location?: string | null
          mentor_id?: string | null
          session_date: string
          start_at: string
          status?: Database["public"]["Enums"]["session_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          end_at?: string
          id?: string
          location?: string | null
          mentor_id?: string | null
          session_date?: string
          start_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          batch: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          program_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          batch?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          program_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          batch?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          program_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          profile_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          profile_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last_message_at: string | null
          title: string | null
          type: Database["public"]["Enums"]["conversation_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          owner_id: string | null
          related_event_id: string | null
          related_student_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          size_bytes: number | null
          source_role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          virus_clean: boolean | null
          virus_scanned: boolean
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          owner_id?: string | null
          related_event_id?: string | null
          related_student_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes?: number | null
          source_role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          virus_clean?: boolean | null
          virus_scanned?: boolean
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          owner_id?: string | null
          related_event_id?: string | null
          related_student_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes?: number | null
          source_role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          virus_clean?: boolean | null
          virus_scanned?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_related_event_id_fkey"
            columns: ["related_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_related_student_id_fkey"
            columns: ["related_student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "documents_related_student_id_fkey"
            columns: ["related_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          class_id: string | null
          enrolled_at: string
          id: string
          program_id: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Insert: {
          class_id?: string | null
          enrolled_at?: string
          id?: string
          program_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Update: {
          class_id?: string | null
          enrolled_at?: string
          id?: string
          program_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      escalations: {
        Row: {
          assigned_to: string | null
          conversation_id: string | null
          created_at: string
          id: string
          notes: string | null
          raised_by: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["escalation_status"]
          student_id: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          raised_by?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["escalation_status"]
          student_id?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          raised_by?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["escalation_status"]
          student_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "escalations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      event_materials: {
        Row: {
          event_id: string
          file_type: string | null
          file_url: string
          id: string
          name: string | null
        }
        Insert: {
          event_id: string
          file_type?: string | null
          file_url: string
          id?: string
          name?: string | null
        }
        Update: {
          event_id?: string
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_materials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: string
          id: string
          invited_role: Database["public"]["Enums"]["user_role"] | null
          profile_id: string | null
          rsvp: string | null
        }
        Insert: {
          event_id: string
          id?: string
          invited_role?: Database["public"]["Enums"]["user_role"] | null
          profile_id?: string | null
          rsvp?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          invited_role?: Database["public"]["Enums"]["user_role"] | null
          profile_id?: string | null
          rsvp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_at: string | null
          id: string
          location: string | null
          meal_plan: string | null
          participant_labels: string[]
          start_at: string
          time_label: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          meal_plan?: string | null
          participant_labels?: string[]
          start_at: string
          time_label?: string | null
          title: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          meal_plan?: string | null
          participant_labels?: string[]
          start_at?: string
          time_label?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["form_submission_status"]
          submitted_at: string
          submitted_by: string | null
        }
        Insert: {
          data?: Json
          form_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["form_submission_status"]
          submitted_at?: string
          submitted_by?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["form_submission_status"]
          submitted_at?: string
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          requires_signature: boolean
          schema: Json
          status: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["form_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          requires_signature?: boolean
          schema?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          type?: Database["public"]["Enums"]["form_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          requires_signature?: boolean
          schema?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          type?: Database["public"]["Enums"]["form_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_albums: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "gallery_albums_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          album_id: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          phone: string | null
          profile_id: string | null
          relationship: string | null
          student_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          profile_id?: string | null
          relationship?: string | null
          student_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          phone?: string | null
          profile_id?: string | null
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          issued_date: string
          organization_id: string | null
          paid_date: string | null
          program_id: string | null
          sponsor_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_date?: string
          organization_id?: string | null
          paid_date?: string | null
          program_id?: string | null
          sponsor_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issued_date?: string
          organization_id?: string | null
          paid_date?: string | null
          program_id?: string | null
          sponsor_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_student_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          is_primary: boolean
          mentor_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_primary?: boolean
          mentor_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          is_primary?: boolean
          mentor_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_student_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_student_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_student_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "mentor_student_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          about: string | null
          address: string | null
          availability: Database["public"]["Enums"]["availability_status"]
          created_at: string
          department: string | null
          education: string[]
          experience_years: number | null
          expertise: string | null
          id: string
          join_date: string | null
          rating: number | null
          status: Database["public"]["Enums"]["user_status"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          about?: string | null
          address?: string | null
          availability?: Database["public"]["Enums"]["availability_status"]
          created_at?: string
          department?: string | null
          education?: string[]
          experience_years?: number | null
          expertise?: string | null
          id: string
          join_date?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["user_status"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          about?: string | null
          address?: string | null
          availability?: Database["public"]["Enums"]["availability_status"]
          created_at?: string
          department?: string | null
          education?: string[]
          experience_years?: number | null
          expertise?: string | null
          id?: string
          join_date?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["user_status"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          file_name: string | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
          size_bytes: number | null
        }
        Insert: {
          file_name?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
          size_bytes?: number | null
        }
        Update: {
          file_name?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          id: string
          sender_id: string | null
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          sender_id?: string | null
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      note_attachments: {
        Row: {
          file_url: string
          id: string
          name: string | null
          note_id: string
        }
        Insert: {
          file_url: string
          id?: string
          name?: string | null
          note_id: string
        }
        Update: {
          file_url?: string
          id?: string
          name?: string | null
          note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string | null
          author_role: Database["public"]["Enums"]["user_role"] | null
          category: string | null
          content: string | null
          created_at: string
          id: string
          session_id: string | null
          status: Database["public"]["Enums"]["review_status"]
          student_id: string | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["note_visibility"]
        }
        Insert: {
          author_id?: string | null
          author_role?: Database["public"]["Enums"]["user_role"] | null
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          student_id?: string | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["note_visibility"]
        }
        Update: {
          author_id?: string | null
          author_role?: Database["public"]["Enums"]["user_role"] | null
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          student_id?: string | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["note_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error: string | null
          id: string
          notification_id: string | null
          provider: string | null
          provider_ref: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string | null
          provider?: string | null
          provider_ref?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string | null
          provider?: string | null
          provider_ref?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean
          in_app_enabled: boolean
          profile_id: string
          sms_enabled: boolean
          type_overrides: Json
          updated_at: string
        }
        Insert: {
          email_enabled?: boolean
          in_app_enabled?: boolean
          profile_id: string
          sms_enabled?: boolean
          type_overrides?: Json
          updated_at?: string
        }
        Update: {
          email_enabled?: boolean
          in_app_enabled?: boolean
          profile_id?: string
          sms_enabled?: boolean
          type_overrides?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
          program_id: string | null
          recorded_by: string | null
          reference: string | null
          sponsor_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          program_id?: string | null
          recorded_by?: string | null
          reference?: string | null
          sponsor_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          program_id?: string | null
          recorded_by?: string | null
          reference?: string | null
          sponsor_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string | null
          group_name: string
          id: string
          key: string
          title: string
        }
        Insert: {
          description?: string | null
          group_name: string
          id?: string
          key: string
          title: string
        }
        Update: {
          description?: string | null
          group_name?: string
          id?: string
          key?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          custom_role_id: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          custom_role_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          custom_role_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string | null
          course: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          downloads: number
          estimated_time: string | null
          featured: boolean
          file_url: string | null
          id: string
          kind: Database["public"]["Enums"]["resource_kind"]
          link_url: string | null
          program_id: string | null
          rating: number | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["review_status"]
          tags: string[]
          title: string
          updated_at: string
          uploaded_by: string | null
          uploader_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          category?: string | null
          course?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          downloads?: number
          estimated_time?: string | null
          featured?: boolean
          file_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["resource_kind"]
          link_url?: string | null
          program_id?: string | null
          rating?: number | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          tags?: string[]
          title: string
          updated_at?: string
          uploaded_by?: string | null
          uploader_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          category?: string | null
          course?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          downloads?: number
          estimated_time?: string | null
          featured?: boolean
          file_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["resource_kind"]
          link_url?: string | null
          program_id?: string | null
          rating?: number | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          uploader_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          form_submission_id: string
          id: string
          ip_address: unknown
          signature_data: string | null
          signature_url: string | null
          signed_at: string
          signer_id: string | null
          signer_name: string | null
        }
        Insert: {
          form_submission_id: string
          id?: string
          ip_address?: unknown
          signature_data?: string | null
          signature_url?: string | null
          signed_at?: string
          signer_id?: string | null
          signer_name?: string | null
        }
        Update: {
          form_submission_id?: string
          id?: string
          ip_address?: unknown
          signature_data?: string | null
          signature_url?: string | null
          signed_at?: string
          signer_id?: string | null
          signer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_team_members: {
        Row: {
          access_level: string
          can_remove: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          role: string | null
          sponsor_id: string
        }
        Insert: {
          access_level?: string
          can_remove?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string | null
          sponsor_id: string
        }
        Update: {
          access_level?: string
          can_remove?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_team_members_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          city: string | null
          company_name: string
          company_size: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          is_public: boolean
          logo_url: string | null
          media_links: string[]
          message: string | null
          phone: string | null
          profile_id: string | null
          state: string | null
          status: Database["public"]["Enums"]["sponsor_status"]
          tier: Database["public"]["Enums"]["sponsorship_tier"] | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          company_name: string
          company_size?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean
          logo_url?: string | null
          media_links?: string[]
          message?: string | null
          phone?: string | null
          profile_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["sponsor_status"]
          tier?: Database["public"]["Enums"]["sponsorship_tier"] | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          company_name?: string
          company_size?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          is_public?: boolean
          logo_url?: string | null
          media_links?: string[]
          message?: string | null
          phone?: string | null
          profile_id?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["sponsor_status"]
          tier?: Database["public"]["Enums"]["sponsorship_tier"] | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_impact: {
        Row: {
          id: string
          label: string
          program_id: string
          value: string
        }
        Insert: {
          id?: string
          label: string
          program_id: string
          value: string
        }
        Update: {
          id?: string
          label?: string
          program_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_impact_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_programs: {
        Row: {
          amount: number | null
          created_at: string
          deliverables: string[]
          end_date: string | null
          id: string
          name: string
          sponsor_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["program_status"]
          tier: Database["public"]["Enums"]["sponsorship_tier"] | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          deliverables?: string[]
          end_date?: string | null
          id?: string
          name: string
          sponsor_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          tier?: Database["public"]["Enums"]["sponsorship_tier"] | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          deliverables?: string[]
          end_date?: string | null
          id?: string
          name?: string
          sponsor_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          tier?: Database["public"]["Enums"]["sponsorship_tier"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_programs_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_requests: {
        Row: {
          amount: number | null
          benefits: string[]
          company_name: string | null
          contact_name: string | null
          duration_months: number | null
          email: string | null
          id: string
          phone: string | null
          program_name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sponsor_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string
          tier: Database["public"]["Enums"]["sponsorship_tier"] | null
        }
        Insert: {
          amount?: number | null
          benefits?: string[]
          company_name?: string | null
          contact_name?: string | null
          duration_months?: number | null
          email?: string | null
          id?: string
          phone?: string | null
          program_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string
          tier?: Database["public"]["Enums"]["sponsorship_tier"] | null
        }
        Update: {
          amount?: number | null
          benefits?: string[]
          company_name?: string | null
          contact_name?: string | null
          duration_months?: number | null
          email?: string | null
          id?: string
          phone?: string | null
          program_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sponsor_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string
          tier?: Database["public"]["Enums"]["sponsorship_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsorship_requests_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_timeline: {
        Row: {
          due_date: string | null
          id: string
          label: string
          program_id: string
          sort_order: number
          state: Database["public"]["Enums"]["timeline_state"]
        }
        Insert: {
          due_date?: string | null
          id?: string
          label: string
          program_id: string
          sort_order?: number
          state?: Database["public"]["Enums"]["timeline_state"]
        }
        Update: {
          due_date?: string | null
          id?: string
          label?: string
          program_id?: string
          sort_order?: number
          state?: Database["public"]["Enums"]["timeline_state"]
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_timeline_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      student_activities: {
        Row: {
          description: string | null
          id: string
          occurred_at: string
          student_id: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          description?: string | null
          id?: string
          occurred_at?: string
          student_id: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          description?: string | null
          id?: string
          occurred_at?: string
          student_id?: string
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "student_activities_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_activities_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_goals: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          progress: number
          status: Database["public"]["Enums"]["goal_status"]
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["goal_status"]
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          about: string | null
          academic_year: string | null
          address: string | null
          attendance_code: string | null
          course: string | null
          created_at: string
          date_of_birth: string | null
          enrollment_date: string | null
          expected_graduation: string | null
          gpa: number | null
          id: string
          organization_id: string | null
          school: string | null
          status: Database["public"]["Enums"]["user_status"]
          student_code: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          academic_year?: string | null
          address?: string | null
          attendance_code?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          enrollment_date?: string | null
          expected_graduation?: string | null
          gpa?: number | null
          id: string
          organization_id?: string | null
          school?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          student_code?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          academic_year?: string | null
          address?: string | null
          attendance_code?: string | null
          course?: string | null
          created_at?: string
          date_of_birth?: string | null
          enrollment_date?: string | null
          expected_graduation?: string | null
          gpa?: number | null
          id?: string
          organization_id?: string | null
          school?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          student_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          organization_id: string | null
          plan_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          organization_id?: string | null
          plan_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          organization_id?: string | null
          plan_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      system_backups: {
        Row: {
          completed_at: string | null
          id: string
          location: string | null
          size_bytes: number | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          location?: string | null
          size_bytes?: number | null
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          location?: string | null
          size_bytes?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      organization_stats: {
        Row: {
          id: string | null
          mentors: number | null
          name: string | null
          programs: number | null
          students: number | null
        }
        Insert: {
          id?: string | null
          mentors?: never
          name?: string | null
          programs?: never
          students?: never
        }
        Update: {
          id?: string | null
          mentors?: never
          name?: string | null
          programs?: never
          students?: never
        }
        Relationships: []
      }
      student_attendance_summary: {
        Row: {
          absent: number | null
          attendance_pct: number | null
          late: number | null
          present: number | null
          student_id: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: { target: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      absence_report_status:
        | "pending"
        | "reviewed"
        | "excused"
        | "unexcused"
        | "rejected"
      activity_type:
        | "session"
        | "report"
        | "badge"
        | "goal"
        | "document"
        | "note"
        | "system"
      attendance_method: "ipad_code" | "selfie" | "manual" | "import"
      attendance_status:
        | "present"
        | "absent"
        | "late"
        | "pending"
        | "excused_absent"
      availability_status: "available" | "limited" | "full" | "unavailable"
      content_status: "draft" | "published" | "archived"
      conversation_type: "direct" | "group"
      delivery_status: "queued" | "sent" | "delivered" | "failed" | "skipped"
      enrollment_status: "active" | "completed" | "withdrawn" | "pending"
      escalation_status: "open" | "in_progress" | "resolved" | "dismissed"
      event_type:
        | "session"
        | "meeting"
        | "deadline"
        | "holiday"
        | "workshop"
        | "fundraiser"
        | "other"
      excuse_status: "none" | "excused" | "unexcused"
      form_submission_status: "draft" | "submitted" | "approved" | "rejected"
      form_type:
        | "enrollment"
        | "consent"
        | "permission"
        | "survey"
        | "feedback"
        | "agreement"
        | "other"
      goal_status: "not_started" | "in_progress" | "completed" | "on_hold"
      invoice_status:
        | "draft"
        | "pending"
        | "paid"
        | "overdue"
        | "outstanding"
        | "void"
      log_status: "success" | "failed"
      note_visibility: "shared" | "private"
      notification_channel: "in_app" | "email" | "sms"
      notification_type:
        | "message"
        | "session"
        | "alert"
        | "document"
        | "student"
        | "event"
        | "sponsor"
        | "billing"
        | "system"
      organization_type:
        | "university"
        | "company"
        | "nonprofit"
        | "government"
        | "school"
        | "other"
      payment_method:
        | "wire_transfer"
        | "ach"
        | "check"
        | "card"
        | "cash"
        | "other"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      program_status: "active" | "pending" | "completed" | "archived"
      request_status: "pending" | "under_review" | "approved" | "rejected"
      resource_kind: "file" | "link" | "image" | "video"
      review_status: "pending" | "approved" | "rejected" | "flagged"
      session_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      sponsor_status: "pending" | "approved" | "rejected" | "inactive"
      sponsorship_tier: "platinum" | "gold" | "silver" | "bronze"
      subscription_status: "active" | "trialing" | "past_due" | "cancelled"
      timeline_state: "done" | "in_progress" | "pending"
      user_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "mentor"
        | "student"
        | "sponsor"
        | "parent"
      user_status: "active" | "inactive" | "suspended" | "pending" | "invited"
      visibility: "public" | "private" | "role_based"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

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

export const Constants = {
  public: {
    Enums: {
      absence_report_status: [
        "pending",
        "reviewed",
        "excused",
        "unexcused",
        "rejected",
      ],
      activity_type: [
        "session",
        "report",
        "badge",
        "goal",
        "document",
        "note",
        "system",
      ],
      attendance_method: ["ipad_code", "selfie", "manual", "import"],
      attendance_status: [
        "present",
        "absent",
        "late",
        "pending",
        "excused_absent",
      ],
      availability_status: ["available", "limited", "full", "unavailable"],
      content_status: ["draft", "published", "archived"],
      conversation_type: ["direct", "group"],
      delivery_status: ["queued", "sent", "delivered", "failed", "skipped"],
      enrollment_status: ["active", "completed", "withdrawn", "pending"],
      escalation_status: ["open", "in_progress", "resolved", "dismissed"],
      event_type: [
        "session",
        "meeting",
        "deadline",
        "holiday",
        "workshop",
        "fundraiser",
        "other",
      ],
      excuse_status: ["none", "excused", "unexcused"],
      form_submission_status: ["draft", "submitted", "approved", "rejected"],
      form_type: [
        "enrollment",
        "consent",
        "permission",
        "survey",
        "feedback",
        "agreement",
        "other",
      ],
      goal_status: ["not_started", "in_progress", "completed", "on_hold"],
      invoice_status: [
        "draft",
        "pending",
        "paid",
        "overdue",
        "outstanding",
        "void",
      ],
      log_status: ["success", "failed"],
      note_visibility: ["shared", "private"],
      notification_channel: ["in_app", "email", "sms"],
      notification_type: [
        "message",
        "session",
        "alert",
        "document",
        "student",
        "event",
        "sponsor",
        "billing",
        "system",
      ],
      organization_type: [
        "university",
        "company",
        "nonprofit",
        "government",
        "school",
        "other",
      ],
      payment_method: [
        "wire_transfer",
        "ach",
        "check",
        "card",
        "cash",
        "other",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      program_status: ["active", "pending", "completed", "archived"],
      request_status: ["pending", "under_review", "approved", "rejected"],
      resource_kind: ["file", "link", "image", "video"],
      review_status: ["pending", "approved", "rejected", "flagged"],
      session_status: ["scheduled", "in_progress", "completed", "cancelled"],
      sponsor_status: ["pending", "approved", "rejected", "inactive"],
      sponsorship_tier: ["platinum", "gold", "silver", "bronze"],
      subscription_status: ["active", "trialing", "past_due", "cancelled"],
      timeline_state: ["done", "in_progress", "pending"],
      user_role: [
        "super_admin",
        "admin",
        "manager",
        "mentor",
        "student",
        "sponsor",
        "parent",
      ],
      user_status: ["active", "inactive", "suspended", "pending", "invited"],
      visibility: ["public", "private", "role_based"],
    },
  },
} as const
