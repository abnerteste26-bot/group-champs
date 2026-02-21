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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campeonato_timer: {
        Row: {
          campeonato_id: string
          id: string
          paused_at: string | null
          started_at: string | null
          status: string
          tempo_acumulado: number
          updated_at: string
        }
        Insert: {
          campeonato_id: string
          id?: string
          paused_at?: string | null
          started_at?: string | null
          status?: string
          tempo_acumulado?: number
          updated_at?: string
        }
        Update: {
          campeonato_id?: string
          id?: string
          paused_at?: string | null
          started_at?: string | null
          status?: string
          tempo_acumulado?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campeonato_timer_campeonato_id_fkey"
            columns: ["campeonato_id"]
            isOneToOne: true
            referencedRelation: "campeonatos"
            referencedColumns: ["id"]
          },
        ]
      }
      campeonatos: {
        Row: {
          campeao_id: string | null
          created_at: string
          edicao: string | null
          id: string
          inscricoes_abertas: boolean
          max_times: number
          nome: string
          status: Database["public"]["Enums"]["status_campeonato"]
          times_confirmados: number
          updated_at: string
        }
        Insert: {
          campeao_id?: string | null
          created_at?: string
          edicao?: string | null
          id?: string
          inscricoes_abertas?: boolean
          max_times?: number
          nome: string
          status?: Database["public"]["Enums"]["status_campeonato"]
          times_confirmados?: number
          updated_at?: string
        }
        Update: {
          campeao_id?: string | null
          created_at?: string
          edicao?: string | null
          id?: string
          inscricoes_abertas?: boolean
          max_times?: number
          nome?: string
          status?: Database["public"]["Enums"]["status_campeonato"]
          times_confirmados?: number
          updated_at?: string
        }
        Relationships: []
      }
      classificacao: {
        Row: {
          campeonato_id: string
          derrotas: number
          empates: number
          gols_contra: number
          gols_pro: number
          grupo_id: string
          id: string
          jogos: number
          pontos: number
          posicao: number | null
          saldo_gols: number
          time_id: string
          updated_at: string
          vitorias: number
        }
        Insert: {
          campeonato_id: string
          derrotas?: number
          empates?: number
          gols_contra?: number
          gols_pro?: number
          grupo_id: string
          id?: string
          jogos?: number
          pontos?: number
          posicao?: number | null
          saldo_gols?: number
          time_id: string
          updated_at?: string
          vitorias?: number
        }
        Update: {
          campeonato_id?: string
          derrotas?: number
          empates?: number
          gols_contra?: number
          gols_pro?: number
          grupo_id?: string
          id?: string
          jogos?: number
          pontos?: number
          posicao?: number | null
          saldo_gols?: number
          time_id?: string
          updated_at?: string
          vitorias?: number
        }
        Relationships: [
          {
            foreignKeyName: "classificacao_campeonato_id_fkey"
            columns: ["campeonato_id"]
            isOneToOne: false
            referencedRelation: "campeonatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classificacao_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classificacao_time_id_fkey"
            columns: ["time_id"]
            isOneToOne: false
            referencedRelation: "times"
            referencedColumns: ["id"]
          },
        ]
      }
      grupo_times: {
        Row: {
          data_insercao: string
          grupo_id: string
          id: string
          time_id: string
        }
        Insert: {
          data_insercao?: string
          grupo_id: string
          id?: string
          time_id: string
        }
        Update: {
          data_insercao?: string
          grupo_id?: string
          id?: string
          time_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupo_times_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_times_time_id_fkey"
            columns: ["time_id"]
            isOneToOne: true
            referencedRelation: "times"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          campeonato_id: string
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          campeonato_id: string
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          campeonato_id?: string
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_campeonato_id_fkey"
            columns: ["campeonato_id"]
            isOneToOne: false
            referencedRelation: "campeonatos"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes_pendentes: {
        Row: {
          aceite_regulamento: boolean
          campeonato_id: string
          created_at: string
          id: string
          nome_time: string
          observacao: string | null
          responsavel: string
          status: Database["public"]["Enums"]["status_inscricao"]
          updated_at: string
        }
        Insert: {
          aceite_regulamento?: boolean
          campeonato_id: string
          created_at?: string
          id?: string
          nome_time: string
          observacao?: string | null
          responsavel: string
          status?: Database["public"]["Enums"]["status_inscricao"]
          updated_at?: string
        }
        Update: {
          aceite_regulamento?: boolean
          campeonato_id?: string
          created_at?: string
          id?: string
          nome_time?: string
          observacao?: string | null
          responsavel?: string
          status?: Database["public"]["Enums"]["status_inscricao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_pendentes_campeonato_id_fkey"
            columns: ["campeonato_id"]
            isOneToOne: false
            referencedRelation: "campeonatos"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_admin: {
        Row: {
          acao: string
          created_at: string
          detalhes: Json | null
          id: string
          ip: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          ip?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          detalhes?: Json | null
          id?: string
          ip?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      partidas: {
        Row: {
          campeonato_id: string
          contestacao: string | null
          created_at: string
          enviado_por: string | null
          fase: Database["public"]["Enums"]["fase_partida"]
          gols_a: number | null
          gols_a_enviado: number | null
          gols_b: number | null
          gols_b_enviado: number | null
          grupo_id: string | null
          id: string
          observacao_admin: string | null
          rodada: number | null
          status: Database["public"]["Enums"]["status_partida"]
          time_a_id: string
          time_b_id: string
          updated_at: string
        }
        Insert: {
          campeonato_id: string
          contestacao?: string | null
          created_at?: string
          enviado_por?: string | null
          fase?: Database["public"]["Enums"]["fase_partida"]
          gols_a?: number | null
          gols_a_enviado?: number | null
          gols_b?: number | null
          gols_b_enviado?: number | null
          grupo_id?: string | null
          id?: string
          observacao_admin?: string | null
          rodada?: number | null
          status?: Database["public"]["Enums"]["status_partida"]
          time_a_id: string
          time_b_id: string
          updated_at?: string
        }
        Update: {
          campeonato_id?: string
          contestacao?: string | null
          created_at?: string
          enviado_por?: string | null
          fase?: Database["public"]["Enums"]["fase_partida"]
          gols_a?: number | null
          gols_a_enviado?: number | null
          gols_b?: number | null
          gols_b_enviado?: number | null
          grupo_id?: string | null
          id?: string
          observacao_admin?: string | null
          rodada?: number | null
          status?: Database["public"]["Enums"]["status_partida"]
          time_a_id?: string
          time_b_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partidas_campeonato_id_fkey"
            columns: ["campeonato_id"]
            isOneToOne: false
            referencedRelation: "campeonatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_time_a_id_fkey"
            columns: ["time_a_id"]
            isOneToOne: false
            referencedRelation: "times"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partidas_time_b_id_fkey"
            columns: ["time_b_id"]
            isOneToOne: false
            referencedRelation: "times"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      times: {
        Row: {
          ativo: boolean
          campeonato_id: string
          created_at: string
          escudo_url: string | null
          id: string
          login_gerado: string | null
          nome: string
          responsavel: string
          senha_gerada: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          ativo?: boolean
          campeonato_id: string
          created_at?: string
          escudo_url?: string | null
          id?: string
          login_gerado?: string | null
          nome: string
          responsavel: string
          senha_gerada?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string
        }
        Update: {
          ativo?: boolean
          campeonato_id?: string
          created_at?: string
          escudo_url?: string | null
          id?: string
          login_gerado?: string | null
          nome?: string
          responsavel?: string
          senha_gerada?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "times_campeonato_id_fkey"
            columns: ["campeonato_id"]
            isOneToOne: false
            referencedRelation: "campeonatos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      distribuir_time_em_grupo: {
        Args: { p_campeonato_id: string; p_time_id: string }
        Returns: string
      }
      gerar_partidas_grupos: {
        Args: { p_campeonato_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      recalcular_classificacao: {
        Args: { p_campeonato_id: string; p_grupo_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "time"
      fase_partida: "grupos" | "oitavas" | "quartas" | "semi" | "final"
      status_campeonato:
        | "inscricoes_abertas"
        | "inscricoes_encerradas"
        | "grupos"
        | "mata_mata"
        | "encerrado"
      status_inscricao: "pendente" | "aprovada" | "rejeitada"
      status_partida: "pendente" | "enviada" | "confirmada" | "ajustada"
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
      app_role: ["admin", "time"],
      fase_partida: ["grupos", "oitavas", "quartas", "semi", "final"],
      status_campeonato: [
        "inscricoes_abertas",
        "inscricoes_encerradas",
        "grupos",
        "mata_mata",
        "encerrado",
      ],
      status_inscricao: ["pendente", "aprovada", "rejeitada"],
      status_partida: ["pendente", "enviada", "confirmada", "ajustada"],
    },
  },
} as const
