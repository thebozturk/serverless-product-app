import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";
const yup = require("yup");

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "ProductsTable";
const headers = {
  "content-type": "application/json",
};

const schema = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup.number().required(),
});
export const createProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    await schema.validate(reqBody, { abortEarly: false });

    const product = {
      ...reqBody,
      productID: v4(),
    };

    await docClient
      .put({
        TableName: tableName,
        Item: product,
      })
      .promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(product),
    };
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        Error: Error,
      }),
    };
  }
};

const fetchProductById = async (id: string) => {
  const output = await docClient
    .get({
      TableName: tableName,
      Key: {
        productID: id,
      },
    })
    .promise();
};
export const getProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const product = await fetchProductById(event.pathParameters?.id as string);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (e) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        Error: Error,
      }),
    };
  }
};

export const updateProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;
    const reqBody = JSON.parse(event.body as string);

    await schema.validate(reqBody, { abortEarly: false });

    const product = {
      ...reqBody,
      productID: id,
    };

    await docClient
      .put({
        TableName: tableName,
        Item: product,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        Error: Error,
      }),
    };
  }
};

export const deleteProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;

    await fetchProductById(id);

    await docClient
      .delete({
        TableName: tableName,
        Key: {
          productID: id,
        },
      })
      .promise();

    return {
      statusCode: 204,
      body: "",
    };
  } catch {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        Error: Error,
      }),
    };
  }
};

export const listProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const output = await docClient
    .scan({
      TableName: tableName,
    })
    .promise();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(output.Items),
  };
};
