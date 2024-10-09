import { createLog, getTeamsBySessionId } from "../utils/dynamodb";

export const handler = async (event: any) => {
  try {
    // Get user information
    const userId =
      event?.requestContext?.jwt?.claims?.username ||
      event?.requestContext?.authorizer?.jwt?.claims?.username;

    // Check body has required items
    if (!event.queryStringParameters.session_id) {
      throw "Missing attribute session_id in query string";
    }

    let session_id = event.queryStringParameters.session_id;
    let r = await getTeamsBySessionId(session_id);

    await createLog(
      `${userId} retrieved teams from session ${session_id}`,
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
