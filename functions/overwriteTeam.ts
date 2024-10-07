import { v4 as uuidv4 } from "uuid";
import { Team } from "../schemas/teamSchema";
import { putIntoTeamTable } from "../utils/dynamodb";
export const handler = async (event: any) => {
  try {
    // Check body has required items
    let body = JSON.parse(event.body);
    if (!body.team) {
      throw "Missing attribute team in body";
    }
    if (!body.team.session_id) {
      throw "Missing attribute session_id in team";
    }
    if (!body.team.team_name) {
      throw "Missing attribute team_name in team";
    }

    // Put updated team into dynamodb table
    let team: Team = body.team;
    let resp = await putIntoTeamTable(team);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
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
