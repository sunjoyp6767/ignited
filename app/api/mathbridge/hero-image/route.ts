import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

const heroImagePath =
  "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_math_class-4582360c-a1f7-4978-afd1-2d6f1ac6b318.png";

export async function GET() {
  try {
    const data = await readFile(heroImagePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Image unavailable", { status: 404 });
  }
}
