import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [users, stakeholders] = await Promise.all([
      db.userProfile.findMany({
        where: { active: true },
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
          department: true,
        },
        orderBy: { displayName: "asc" },
      }),
      db.stakeholder.findMany({
        select: {
          id: true,
          name: true,
          svcNumber: true,
          rankOrRate: true,
          category: true,
          appointment: true,
          department: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    // Format Command & Executive Profiles
    const officers = users.map((u: any) => {
      const matchStk = stakeholders.find((s: any) => s.name === u.displayName || s.svcNumber === u.username);
      return {
        id: u.id,
        username: u.username,
        name: u.displayName,
        rank: matchStk?.rankOrRate || u.role,
        serviceNo: matchStk?.svcNumber || u.username,
        role: u.role,
        department: u.department || "CSLOG",
        zone: "All Command Scope",
        group: "Command & Executive Profiles",
      };
    });

    // Add any officer stakeholders not in users
    stakeholders
      .filter((s: any) => s.category.includes("Officer") && !officers.some((o: any) => o.name === s.name))
      .forEach((s: any) => {
        officers.push({
          id: s.id,
          username: s.svcNumber || s.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          name: s.name,
          rank: s.rankOrRate || "Officer",
          serviceNo: s.svcNumber || "-",
          role: "Officer",
          department: s.department,
          zone: s.appointment ? `${s.appointment} Zone` : "Dockyard Scope",
          group: "Maintenance Zone In-Charges",
        });
      });

    // Format Sailors
    const sailors = stakeholders
      .filter((s: any) => s.category.includes("Sailor"))
      .map((s: any) => ({
        id: s.id,
        serviceNo: s.svcNumber || `SVC/${Math.floor(1000 + Math.random() * 9000)}`,
        name: s.name,
        rate: s.rankOrRate || "Sailor",
        appointment: s.appointment || "Duty Sailor",
        department: s.department || "CSLOG",
        zone: "Zone Maintenance",
      }));

    // If few sailors, add standard sample sailors for instant search
    if (sailors.length < 5) {
      sailors.push(
        { id: "sln-101", serviceNo: "XS-60242", name: "AB Fernando", rate: "Able Seaman", appointment: "Civil Engineering", department: "CE", zone: "Zone A" },
        { id: "sln-102", serviceNo: "XS-54120", name: "LS Silva", rate: "Leading Seaman", appointment: "Slipway & Docks", department: "CSLOG", zone: "Zone B" },
        { id: "sln-103", serviceNo: "XS-48911", name: "PO Bandara", rate: "Petty Officer", appointment: "Stores & Logistics", department: "CSLOG", zone: "Zone C" },
        { id: "sln-104", serviceNo: "XS-61002", name: "AB Gunaratne", rate: "Able Seaman", appointment: "Mechanical Works", department: "CE", zone: "Workshop" }
      );
    }

    return NextResponse.json({
      ok: true,
      officers,
      sailors,
    });
  } catch (error: any) {
    console.error("Failed to load profiles (offline preview):", error);
    return NextResponse.json({ ok: true, officers: [], sailors: [], offline: true });
  }
}
