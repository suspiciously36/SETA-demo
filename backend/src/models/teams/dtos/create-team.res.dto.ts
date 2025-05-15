export class CreateTeamResDto {
  teamId: string;
  teamName: string;
  managers: { managerId: string; managerName: string }[];
  members: { memberId: string; memberName: string }[];
}
