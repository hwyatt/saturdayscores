import { Team } from "../components/scoreBug";

export const findMatchingTeam = (teamName: string, teams: Team[]) =>
  teams.find(
    (team) =>
      teamName.includes(team.school) && teamName.includes(team.mascot ?? "")
  );

export const getTeamInfo = (
  fullTeamName: string,
  teamList: Team[]
): { school: string; mascot: string } => {
  const matched = teamList.find(
    (team) =>
      fullTeamName.includes(team.school) &&
      fullTeamName.includes(team.mascot ?? "")
  );
  return {
    school: matched?.school || fullTeamName,
    mascot: matched?.mascot || "",
  };
};
