import type { DashboardData } from './data';

export interface Database {
  public: {
    Tables: {
      dashboards: {
        Row: {
          id: string;
          content: DashboardData;
          updated_at: string;
        };
        Insert: {
          id: string;
          content: DashboardData;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: DashboardData;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
