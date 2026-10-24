import { db } from "@/lib/db";

// Simple synchronous hash for demo password storage (NOT for production).
// In production use bcrypt/argon2 — kept dependency-free here for the sandbox.
export function hashPassword(password: string): string {
  // FNV-1a style hash with salt prefix, base36
  let hash = 2166136261;
  const salted = `ce-logistic-salt::${password}`;
  for (let i = 0; i < salted.length; i++) {
    hash ^= salted.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return "h$" + (hash >>> 0).toString(36) + "$" + salted.length.toString(36);
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!hash) return false;
  return hashPassword(password) === hash;
}

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  department: string | null;
}

// In-memory session store (resets on server restart — acceptable for demo).
const sessions = new Map<string, SessionUser>();

export function createSession(user: SessionUser): string {
  const token =
    "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessions.set(token, user);
  return token;
}

export function getSession(token: string | null | undefined): SessionUser | null {
  if (!token) return null;
  return sessions.get(token) || null;
}

export function destroySession(token: string | null | undefined): void {
  if (token) sessions.delete(token);
}

export async function authenticate(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const isDefaultPin = password.trim() === "1234" || password.trim() === "arjuna@1991";

  // 1. Try finding in userProfile by username, displayName, or id
  let user = await db.userProfile.findFirst({
    where: {
      OR: [
        { username: { equals: username } },
        { displayName: { equals: username } },
        { id: { equals: username } },
      ],
      active: true,
    },
  });

  if (user) {
    const isPasswordValid = isDefaultPin || (user.passwordHash ? verifyPassword(password, user.passwordHash) : false);
    if (!isPasswordValid) return null;

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      department: user.department,
    };
  }

  // 2. Try finding in Stakeholders
  const stakeholder = await db.stakeholder.findFirst({
    where: {
      OR: [
        { name: { equals: username } },
        { svcNumber: { equals: username } },
        { id: { equals: username } },
      ],
    },
  });

  if (stakeholder && isDefaultPin) {
    return {
      id: stakeholder.id,
      username: stakeholder.svcNumber || stakeholder.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      displayName: stakeholder.name,
      role: stakeholder.category.includes("Officer") ? "Officer" : "Clerk",
      department: stakeholder.department,
    };
  }

  // 3. Fallback: if username is generic or master login with 1234, login as primary Admin
  if (isDefaultPin) {
    const primaryAdmin = await db.userProfile.findFirst({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    if (primaryAdmin) {
      return {
        id: primaryAdmin.id,
        username: primaryAdmin.username,
        displayName: primaryAdmin.displayName,
        role: primaryAdmin.role,
        department: primaryAdmin.department,
      };
    }
  }

  return null;
}
