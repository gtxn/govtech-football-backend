import { Team } from "../schemas/teamSchema";
import {
  createLog,
  getAllSessionInfo,
  getTeamsBySessionId,
} from "../utils/dynamodb";

export const handler = async (event: any) => {
  try {
    // Get user information
    const userId =
      event?.requestContext?.jwt?.claims?.username ||
      event?.requestContext?.authorizer?.jwt?.claims?.username;

    let items: any = await getAllSessionInfo();

    let sessions_info: Array<{
      session_id: string;
      last_modified_at: number;
      created_at: number;
    }> = [];

    // Get session information from teams table. Session info includes session_id, when it was last modified and created
    items.forEach((item: Team) => {
      // Find if session_info contains an item with session_id of the current table entry
      let sessionItem = sessions_info.find(
        (session) => session.session_id === item.session_id
      );

      // If such an item exists, we update it accordingly
      if (sessionItem) {
        if (
          item?.last_modified_at &&
          sessionItem.last_modified_at < item?.last_modified_at
        ) {
          sessionItem.last_modified_at = item.last_modified_at;
        }
        if (item?.created_at && sessionItem.created_at < item?.created_at) {
          sessionItem.created_at = item.created_at;
        }
      }
      // If not we push the session data of the current table entry
      else if (item.session_id && item.last_modified_at && item.created_at) {
        sessions_info.push({
          session_id: item.session_id,
          last_modified_at: item.last_modified_at,
          created_at: item.created_at,
        });
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: sessions_info,
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
