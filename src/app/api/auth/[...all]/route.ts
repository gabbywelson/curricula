import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: authGET, POST: authPOST } = toNextJsHandler(auth);

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  console.log(`[Auth] GET ${url.pathname}`);
  try {
    const res = await authGET(req);
    return res;
  } catch (err) {
    console.error(`[Auth] GET Error:`, err);
    throw err;
  }
};

export const POST = async (req: Request) => {
  const url = new URL(req.url);
  console.log(`[Auth] POST ${url.pathname}`);
  try {
    const res = await authPOST(req);
    return res;
  } catch (err) {
    console.error(`[Auth] POST Error:`, err);
    throw err;
  }
};
