export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      couple_spaces: {
        Row: {
          id: string
          name: string | null
          invite_code: string
          created_by_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          invite_code: string
          created_by_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          invite_code?: string
          created_by_user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      couple_members: {
        Row: {
          id: string
          couple_space_id: string
          user_id: string
          role: "owner" | "member"
          joined_at: string
        }
        Insert: {
          id?: string
          couple_space_id: string
          user_id: string
          role: "owner" | "member"
          joined_at?: string
        }
        Update: {
          id?: string
          couple_space_id?: string
          user_id?: string
          role?: "owner" | "member"
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          }
        ]
      }
      memories: {
        Row: {
          id: string
          couple_space_id: string
          type: "photo" | "video" | "letter" | "ticket"
          title: string | null
          body: string | null
          media_url: string | null
          storage_key: string | null
          thumbnail_url: string | null
          date_happened: string
          place_name: string | null
          tags: string[]
          collection_id: string | null
          created_by_user_id: string
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_space_id: string
          type: "photo" | "video" | "letter" | "ticket"
          title?: string | null
          body?: string | null
          media_url?: string | null
          storage_key?: string | null
          thumbnail_url?: string | null
          date_happened: string
          place_name?: string | null
          tags?: string[]
          collection_id?: string | null
          created_by_user_id: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_space_id?: string
          type?: "photo" | "video" | "letter" | "ticket"
          title?: string | null
          body?: string | null
          media_url?: string | null
          storage_key?: string | null
          thumbnail_url?: string | null
          date_happened?: string
          place_name?: string | null
          tags?: string[]
          collection_id?: string | null
          created_by_user_id?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          id: string
          couple_space_id: string
          name: string
          type: "trip" | "anniversary" | "custom"
          start_date: string | null
          end_date: string | null
          description: string | null
          created_by_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_space_id: string
          name: string
          type: "trip" | "anniversary" | "custom"
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          created_by_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_space_id?: string
          name?: string
          type?: "trip" | "anniversary" | "custom"
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          created_by_user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      memory_reactions: {
        Row: {
          id: string
          memory_id: string
          user_id: string
          type: "heart"
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          user_id: string
          type: "heart"
          created_at?: string
        }
        Update: {
          id?: string
          memory_id?: string
          user_id?: string
          type?: "heart"
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      list_space_tags: { Args: { space_id: string }; Returns: string[] }
      lookup_space_by_invite_code: {
        Args: { code: string }
        Returns: string
      }
    }
    Enums: {
      member_role: "owner" | "member"
      memory_type: "photo" | "video" | "letter" | "ticket"
      collection_type: "trip" | "anniversary" | "custom"
      reaction_type: "heart"
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Profile = Tables<"profiles">
export type CoupleSpace = Tables<"couple_spaces">
export type CoupleMember = Tables<"couple_members">
export type Memory = Tables<"memories">
export type Collection = Tables<"collections">
export type MemoryReaction = Tables<"memory_reactions">

export type MemoryWithAuthor = Memory & {
  author: { display_name: string | null } | null;
  reactions: { user_id: string; type: "heart" }[];
};
