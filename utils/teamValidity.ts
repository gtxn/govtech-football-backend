import { Team } from "../schemas/teamSchema";

export const checkTeamsValid = (teams: Array<Team>) => {
  // Check that there are 12 teams in total
  if (teams.length !== 12) {
    throw "Must have 12 groups in the tournament";
  }

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

  // If teams have session_id, check that all are the same
  if (teams[0].session_id) {
    if (new Set(teams.map((team) => team.session_id)).size > 1) {
      throw "All teams must have the same session_id";
    }
  }
};
