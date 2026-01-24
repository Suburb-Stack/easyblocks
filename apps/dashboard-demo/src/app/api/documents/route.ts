import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const cookieStore = await cookies();
  cookieStore.set(data.cookieId, data.id);
  return new Response(undefined, {
    status: 200,
  });
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const cookieStore = await cookies();
  cookieStore.delete(data.cookieId);
  return new Response(undefined, {
    status: 200,
  });
}
