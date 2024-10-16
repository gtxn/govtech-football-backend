import {
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DynamoDBDocumentClient,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

import { Team } from "../schemas/teamSchema";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Team table
export const putIntoTeamTable = async (teamItem: Team, sessionId?: string) => {
  const tablename = process.env.TEAM_DYNAMODB_TABLE;

  let params = {
    TableName: tablename,
    Item: {
      ...teamItem,
      last_modified_at: new Date().getTime(),
    },
  };

  // If team is newly created
  if (sessionId) {
    params.Item = {
      ...params.Item,
      session_id: sessionId,
      created_at: new Date().getTime(),
    };
  }
  if (!teamItem?.team_id) {
    params.Item = {
      ...params.Item,
      team_id: uuidv4(),
    };
  }

  const command = new PutCommand(params);

  const response = await docClient.send(command);

  return response;
};

export const getTeamsBySessionId = async (session_id: string) => {
  const tablename = process.env.TEAM_DYNAMODB_TABLE;

  const command = new QueryCommand({
    TableName: tablename,
    KeyConditionExpression: "session_id = :session_id",
    ExpressionAttributeValues: { ":session_id": { S: session_id } },
  });

  const response = await docClient.send(command);
  return response?.Items ? response.Items?.map((item) => unmarshall(item)) : [];
};

export const clearTeamsFromTableBySessionId = async (session_id: string) => {
  const tablename = process.env.TEAM_DYNAMODB_TABLE;

  let teams = await getTeamsBySessionId(session_id);

  let r = await Promise.all(
    teams.map(async (team) => {
      const command = new DeleteCommand({
        TableName: tablename,
        Key: {
          session_id: team.session_id,
          team_id: team.team_id,
        },
      });

      const response = await docClient.send(command);
      return response;
    })
  );

  return r;
};

export const getAllSessionInfo = async () => {
  const tablename = process.env.TEAM_DYNAMODB_TABLE;

  let params = {
    TableName: tablename,
    ProjectionExpression:
      "session_id, team_id, team_name, created_at, last_modified_at",
  };
  const command = new ScanCommand(params);
  const data = await docClient.send(command);

  return data?.Items ? data.Items?.map((item) => unmarshall(item)) : [];
};

// Log table
export const createLog = async (message: string, userId: string) => {
  const tablename = process.env.LOGS_DYNAMODB_TABLE;

  let params = {
    TableName: tablename,
    Item: {
      log_id: uuidv4(),
      message,
      user_id: userId,
      date_created: new Date().getTime(),
    },
  };

  const command = new PutCommand(params);

  const response = await docClient.send(command);

  return response;
};

export const getLogsByUser = async (userId: string) => {
  const tablename = process.env.LOGS_DYNAMODB_TABLE;

  let params = {
    TableName: tablename,
    ExpressionAttributeValues: {
      ":u": {
        S: userId,
      },
    },
    FilterExpression: "user_id = :u",
  };
  const command = new ScanCommand(params);
  const data = await docClient.send(command);

  return data?.Items ? data.Items?.map((item) => unmarshall(item)) : [];
};
