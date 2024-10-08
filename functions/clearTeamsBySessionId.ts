import { clearTeamsFromTableBySessionId } from "../utils/dynamodb";

export const handler = async (event: any) => {
  try {
    // Check body has required items
    let body = JSON.parse(event.body);
    if (!body.session_id) {
      throw "Missing attribute session_id in body";
    }

    let session_id: string = body.session_id;

    // Delete teams
    let resp = await clearTeamsFromTableBySessionId(session_id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        session_id,
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
