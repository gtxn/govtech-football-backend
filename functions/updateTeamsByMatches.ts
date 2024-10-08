import { Match2Player, Team } from "../schemas/teamSchema";
import { putIntoTeamTable } from "../utils/dynamodb";
import { updateTeamsBasedOnMatches } from "../utils/teamSorting";

export const handler = async (event: any) => {
  try {
    // Check body has required items
    let body = JSON.parse(event.body);
    if (!body.teams) {
      throw "Missing attribute teams in body";
    }
    if (!body.matches) {
      throw "Missing attribute matches in body";
    }

    let teams = body.teams;
    let matches: Array<Match2Player> = body.matches;

    // Update teams by matches
    let updatedTeams = updateTeamsBasedOnMatches(teams, matches);

    let r = await Promise.all(
      updatedTeams.map(async (team: any) => {
        return await putIntoTeamTable(team);
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: r,
      }),
    };
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        data: e,
      }),
    };
  }
};
