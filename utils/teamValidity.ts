import { Team } from "../schemas/teamSchema";

export const checkTeamsValid = (teams: Array<Team>) => {
  // Check equal number in each group
  if (
    teams.filter((team) => team.group_number == 1).length !==
    teams.filter((team) => team.group_number == 2).length
  ) {
    throw "Must have equal number of teams in both groups";
  }

  // Check team names not duplicated
  let teamNames = teams.map((team) => team.team_name);
  if (new Set(teamNames).size < teamNames.length) {
    throw "Team names must not be duplicated";
  }
};
