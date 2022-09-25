import { NextApiHandler } from "next";
import fs from "fs/promises";
import path from "path";

const verifyPayload = (payload: any): payload is [number, number][] => {
  return (
    Array.isArray(payload) &&
    payload.length > 0 &&
    payload.every(
      (item) =>
        Array.isArray(item) &&
        item.length === 2 &&
        typeof item[0] === "number" &&
        typeof item[1] === "number"
    )
  );
};

const verifyPostPayload = (payload: any): payload is [number, number][][] => {
  return (
    Array.isArray(payload) &&
    payload.length === 5 &&
    payload.every(verifyPayload)
  );
};

const handler: NextApiHandler = (req, res) => {
  try {
    if (req.method !== "POST") throw new Error("Invalid request");
    if (!req.body.payload || !verifyPostPayload(req.body.payload))
      throw new Error("Invalid payload");
    fs.writeFile(
      path.join(process.cwd(), "public", "config-posts.json"),
      JSON.stringify(req.body.payload)
    );
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(400).end();
  }
};

export default handler;
