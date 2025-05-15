export class CreateTeamReqDto {
  teamName: string;
  managers: { managerId: string; managerName: string }[];
  members: { memberId: string; memberName: string }[];
}
