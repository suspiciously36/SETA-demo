export interface TeamUserInterface {
  id: string;
  team_id: string;
  user_id: string;
  is_main_manager: boolean;
  role: 'manager' | 'member' | 'root';
  createdAt: Date;
  updatedAt: Date;
}
