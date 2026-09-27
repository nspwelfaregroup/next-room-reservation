import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

/**
 * Optimistic check จาก session cookie (ไม่แตะ DB)
 * - ยังไม่ verify กับ LINE   → เข้าได้แค่ "/" (หน้าแรกจะทำ liff.init + login)
 * - verify แล้วแต่ยังไม่ลงทะเบียน → เข้าได้แค่ "/" และ "/register"
 * - ลงทะเบียนแล้ว             → เข้า "/register" ไม่ได้
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return pathname === "/" ? NextResponse.next() : redirectTo("/", request);
  }

  if (!session.registered) {
    return pathname === "/" || pathname === "/register" ? NextResponse.next() : redirectTo("/register", request);
  }

  if (pathname === "/register") return redirectTo("/", request);

  return NextResponse.next();
}

function redirectTo(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url));
}

export const config = {
  // ไม่รวม api, ไฟล์ static และรูป
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"]
};
