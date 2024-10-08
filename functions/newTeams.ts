import { v4 as uuidv4 } from "uuid";
import { Team } from "../schemas/teamSchema";
import { putIntoTeamTable } from "../utils/dynamodb";
import { checkTeamsValid } from "../utils/teamValidity";

export const handler = async (event: any) => {
  try {
    // Check body has required items
    let body = JSON.parse(event.body);
    if (!body.teamsToAdd) {
      throw "Missing attribute teamsToAdd in body";
    }

    let teamsToAdd: Array<Team> = body.teamsToAdd;

    // Check validity of teams
    checkTeamsValid(teamsToAdd);

    // Add teams
    let sessionId = uuidv4();

    // Only allow putting of team information, NOT match details
    let resp = await Promise.all(
      teamsToAdd.map((team: Team) =>
        putIntoTeamTable(
          {
            session_id: team.session_id,
            team_id: team.team_id,
            team_name: team.team_name,
            group_number: team.group_number,
            date_registered: team.date_registered,
          },
          sessionId
        )
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        sessionId,
        data: resp,
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
