import { getTeamsBySessionId } from "../utils/dynamodb";

export const handler = async (event: any) => {
  try {
    // Check body has required items
    if (!event.queryStringParameters.session_id) {
      throw "Missing attribute session_id in query string";
    }

    let r = await getTeamsBySessionId(event.queryStringParameters.session_id);
    console.log(r);

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
