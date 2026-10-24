import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth";
import { DEMO_SESSION_USER } from "@/lib/demo-data";

/**
 * Direct-preview session endpoint.
 *
 * Visiting the app with no credential would normally land on the login wall.
 * For the preview deployment we issue a demo command session immediately so the
 * deck renders on first paint (`?manual=1` or `CMSYS_DIRECT_PREVIEW=0` restores
 * the gate). Real deployments keep the gate: set CMSYS_DIRECT_PREVIEW=0.
 */
const directPreviewEnabled = () =>
  process.env.CMSYS_DIRECT_PREVIEW !== "0" &&
  process.env.NEXT_PUBLIC_DIRECT_PREVIEW !== "0";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ce_session")?.value || null;
    const existing = getSession(token);
    if (existing) {
      return NextResponse.json({ user: existing, authenticated: true });
    }

    const manual = new URL(req.url).searchParams.get("manual") === "1";
    const gateArmed = req.cookies.get("cmsys_gate")?.value === "1";
    if (manual || gateArmed || !directPreviewEnabled()) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    // Silently open a session as the command administrator.
    const user = { ...DEMO_SESSION_USER };
    const freshToken = createSession(user);
    const res = NextResponse.json({
      user,
      authenticated: true,
      directPreview: true,
    });
    res.cookies.set("ce_session", freshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ user: null, authenticated: false });
  }
}
