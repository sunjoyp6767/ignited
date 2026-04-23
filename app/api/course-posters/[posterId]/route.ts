import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { NextResponse } from "next/server";

const posterPathById: Record<string, string> = {
  english:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_A_Level_Coaching_in_Dhaka_01-96ba9c9f-10a4-42a6-a8d6-0515982f38b4.png",
  math:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_Crash_Course_for_O___A_Level_Exams_Dhaka-bc43ff57-dc86-47b9-a5ce-a6dce6252861.png",
  chemistry:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_Private_Coaching-d69e4a4f-2485-4d6c-93d8-bd0d7fb44588.png",
  biology:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_Crash_Courses-acde9b36-189a-40d5-884f-8f2070eeed67.png",
  physics:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_Top_A_Level_Teachers_in_Dhaka-b5252f14-37aa-4dca-b298-acd315449473.png",
};

function contentTypeFromExt(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ posterId: string }> }
) {
  const { posterId } = await params;
  const filePath = posterPathById[posterId];

  if (!filePath) {
    return new NextResponse("Poster not found", { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeFromExt(filePath),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("Poster unavailable", { status: 404 });
  }
}
