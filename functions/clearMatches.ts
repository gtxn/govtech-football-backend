import {
  createLog,
  getTeamsBySessionId,
  putIntoTeamTable,
} from "../utils/dynamodb";

export const handler = async (event: any) => {
  try {
    const userId =
      event?.requestContext?.jwt?.claims?.username ||
      event?.requestContext?.authorizer?.jwt?.claims?.username;

    // Check body has required items
    let body = JSON.parse(event.body);
    if (!body.session_id) {
      throw "Missing attribute session_id in body";
    }

    // Get all teams in session
    let teams = await getTeamsBySessionId(body.session_id);

    // Remove all match related data for each team
    let r = await Promise.all(
      teams.map(async (team) => {
        await putIntoTeamTable({
          session_id: team.session_id,
          team_id: team.team_id,
          team_name: team.team_name,
          date_registered: team.date_registered,
          group_number: team.group_number,
        });
      })
    );

    await createLog(
      `${userId} cleared matches for session ${teams[0].session_id}`,
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
    console.log(e);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        data: e,
      }),
    };
  }
};
