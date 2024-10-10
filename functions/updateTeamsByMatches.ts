import { Match2Player, Team } from "../schemas/teamSchema";
import { createLog, putIntoTeamTable } from "../utils/dynamodb";
import { updateTeamsBasedOnMatches } from "../utils/teamSorting";

export const handler = async (event: any) => {
  try {
    const userId =
      event?.requestContext?.jwt?.claims?.username ||
      event?.requestContext?.authorizer?.jwt?.claims?.username;

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

    await createLog(
      `${userId} edited matches ${matches
        .map((match) => `${match.team1_name} vs ${match.team2_name}`)
        .join(" | ")} for session ${teams[0].session_id}`,
      userId
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
