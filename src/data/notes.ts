export interface Note {
  id: string;
  text: string;
  author: string;
  isAdmin: boolean;
  x: number;
  y: number;
  rotation: number;
  date?: string;
  created_at?: string;
}
