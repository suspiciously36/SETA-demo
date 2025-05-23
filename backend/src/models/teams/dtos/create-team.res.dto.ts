export class CreateTeamResDto {
  id: string;
  team_name: string;
  managers: { managerId: string; managerName: string }[];
  members: { memberId: string; memberName: string }[];
  total_managers: number;
  total_members: number;
}
