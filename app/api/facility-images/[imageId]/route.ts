import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { NextResponse } from "next/server";

const facilityImagePathById: Record<string, string> = {
  acClassroom:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_AC_Class_room-4359a4ec-d2bc-478e-994d-dd797709a090.png",
  digitalMethod1:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_Digital_methoad_for_studying-88800b72-b596-4fca-a315-c2108952c7c3.png",
  digitalMethod2:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_Digital_methoad_for_studying_01-6928c237-bf3d-461f-95d0-20532ef60410.png",
  physicsLab:
    "C:\\Users\\User\\.cursor\\projects\\c-Users-User-Desktop-WebProjects-ignited\\assets\\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_f1de74b79d8f2b5c78a8f77bfafaded1_images_Physics_lab-d06afd4a-b29b-463a-b776-11a72eb8a802.png",
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
  { params }: { params: Promise<{ imageId: string }> }
) {
  const { imageId } = await params;
  const filePath = facilityImagePathById[imageId];

  if (!filePath) {
    return new NextResponse("Facility image not found", { status: 404 });
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
    return new NextResponse("Facility image unavailable", { status: 404 });
  }
}
