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
      bookings: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          deposit_amount: number
          id: string
          notes: string | null
          payment_type: string
          provider_id: string
          quote_id: string | null
          request_id: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          deposit_amount?: number
          id?: string
          notes?: string | null
          payment_type?: string
          provider_id: string
          quote_id?: string | null
          request_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          deposit_amount?: number
          id?: string
          notes?: string | null
          payment_type?: string
          provider_id?: string
          quote_id?: string | null
          request_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      brokered_deals: {
        Row: {
          client_name: string
          commission_earned: number | null
          created_at: string
          event_date: string | null
          id: string
          notes: string | null
          package_id: string | null
          value: number | null
        }
        Insert: {
          client_name: string
          commission_earned?: number | null
          created_at?: string
          event_date?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          value?: number | null
        }
        Update: {
          client_name?: string
          commission_earned?: number | null
          created_at?: string
          event_date?: string | null
          id?: string
          notes?: string | null
          package_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brokered_deals_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "operator_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          city: string | null
          created_at: string
          phone: string | null
          preferred_contact: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          phone?: string | null
          preferred_contact?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          phone?: string | null
          preferred_contact?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events_radar: {
        Row: {
          city: string | null
          created_at: string
          date: string
          estimated_attendance: string | null
          genre: string | null
          id: string
          source: string | null
          ticket_price_range: string | null
          title: string
          venue: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          date: string
          estimated_attendance?: string | null
          genre?: string | null
          id?: string
          source?: string | null
          ticket_price_range?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          date?: string
          estimated_attendance?: string | null
          genre?: string | null
          id?: string
          source?: string | null
          ticket_price_range?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      featured_listings: {
        Row: {
          active_from: string
          active_to: string | null
          category_id: string | null
          created_at: string
          id: string
          position: number | null
          provider_id: string
        }
        Insert: {
          active_from?: string
          active_to?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          position?: number | null
          provider_id: string
        }
        Update: {
          active_from?: string
          active_to?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          position?: number | null
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_listings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      login_events: {
        Row: {
          id: string
          occurred_at: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          id?: string
          occurred_at?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          id?: string
          occurred_at?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      market_rate_index: {
        Row: {
          category: string
          created_at: string
          id: string
          notes: string | null
          rate_high: number | null
          rate_low: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          notes?: string | null
          rate_high?: number | null
          rate_low?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          rate_high?: number | null
          rate_low?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      operator_packages: {
        Row: {
          commission_pct: number | null
          created_at: string
          description: string | null
          event_type: string | null
          id: string
          name: string
          provider_ids: string[]
        }
        Insert: {
          commission_pct?: number | null
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          name: string
          provider_ids: string[]
        }
        Update: {
          commission_pct?: number | null
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          name?: string
          provider_ids?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          bio: string | null
          business_name: string
          category_id: string | null
          city: string | null
          created_at: string
          phone: string | null
          photos: string[] | null
          tier: number
          updated_at: string
          user_id: string
          verified: boolean
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          bio?: string | null
          business_name: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          phone?: string | null
          photos?: string[] | null
          tier?: number
          updated_at?: string
          user_id: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          bio?: string | null
          business_name?: string
          category_id?: string | null
          city?: string | null
          created_at?: string
          phone?: string | null
          photos?: string[] | null
          tier?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          amount: number
          created_at: string
          id: string
          message: string | null
          provider_id: string
          request_id: string
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          message?: string | null
          provider_id: string
          request_id: string
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          provider_id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          budget: number | null
          category_id: string | null
          city: string | null
          client_email: string | null
          client_id: string
          client_name: string | null
          client_phone: string | null
          client_whatsapp: string | null
          created_at: string
          description: string | null
          id: string
          needed_by: string | null
          service_id: string | null
          service_name: string | null
          status: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          category_id?: string | null
          city?: string | null
          client_email?: string | null
          client_id: string
          client_name?: string | null
          client_phone?: string | null
          client_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          needed_by?: string | null
          service_id?: string | null
          service_name?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          category_id?: string | null
          city?: string | null
          client_email?: string | null
          client_id?: string
          client_name?: string | null
          client_phone?: string | null
          client_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          needed_by?: string | null
          service_id?: string | null
          service_name?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          client_id: string
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          base_price: number | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          base_price?: number | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          base_price?: number | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          payment_confirmed_by: string | null
          plan: string
          provider_id: string
          status: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          payment_confirmed_by?: string | null
          plan: string
          provider_id: string
          status?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          payment_confirmed_by?: string | null
          plan?: string
          provider_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venue_availability: {
        Row: {
          available_from: string | null
          available_to: string | null
          capacity: number | null
          city: string | null
          contact: string | null
          created_at: string
          id: string
          venue_name: string
        }
        Insert: {
          available_from?: string | null
          available_to?: string | null
          capacity?: number | null
          city?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          venue_name: string
        }
        Update: {
          available_from?: string | null
          available_to?: string | null
          capacity?: number | null
          city?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          venue_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      provider_matches_request: {
        Args: { _category_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "service_provider" | "admin" | "super_admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "refunded"
      quote_status: "submitted" | "accepted" | "rejected" | "withdrawn"
      request_status: "open" | "in_review" | "awarded" | "closed" | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["client", "service_provider", "admin", "super_admin"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ],
      quote_status: ["submitted", "accepted", "rejected", "withdrawn"],
      request_status: ["open", "in_review", "awarded", "closed", "cancelled"],
    },
  },
} as const
