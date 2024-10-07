import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

import { Team } from "../schemas/teamSchema";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const putIntoTeamTable = async (teamItem: Team, sessionId?: string) => {
  const tablename = process.env.TEAM_DYNAMODB_TABLE;

  let params = {
    TableName: tablename,
    Item: {
      ...teamItem,
      team_id: uuidv4(),
    },
  };

  if (sessionId) {
    params.Item = {
      ...params.Item,
      session_id: sessionId,
    };
  }
  const command = new PutCommand(params);

  const response = await docClient.send(command);

  return response;
};

export const getTeamsBySessionId = async (session_id) => {
  const tablename = process.env.TEAM_DYNAMODB_TABLE;

  const command = new QueryCommand({
    TableName: tablename,
    KeyConditionExpression: "session_id = :session_id",
    ExpressionAttributeValues: { ":session_id": { S: session_id } },
  });

  const response = await docClient.send(command);
  console.log(response);
  return response?.Items ? response.Items?.map((item) => unmarshall(item)) : [];
};
