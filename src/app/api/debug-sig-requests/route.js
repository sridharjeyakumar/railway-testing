import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const depo = searchParams.get('depo');
    
    // Build the query conditions
    let whereCondition = {};
    
    if (department && depo) {
      whereCondition = {
        AND: [
          { selectedDepartment: department },
          { selectedDepo: depo },
          {
            OR: [
              { sigDisconnection: { in: ["Yes", "yes"] } },
              { oheDisconnection: { in: ["Yes", "yes"] } },
              { ohDisconnection: { in: ["Yes", "yes"] } }
            ]
          }
        ]
      };
    } else if (department) {
      whereCondition = {
        AND: [
          { selectedDepartment: department },
          {
            OR: [
              { sigDisconnection: { in: ["Yes", "yes"] } },
              { oheDisconnection: { in: ["Yes", "yes"] } },
              { ohDisconnection: { in: ["Yes", "yes"] } }
            ]
          }
        ]
      };
    } else if (depo) {
      whereCondition = {
        AND: [
          { selectedDepo: depo },
          {
            OR: [
              { sigDisconnection: { in: ["Yes", "yes"] } },
              { oheDisconnection: { in: ["Yes", "yes"] } },
              { ohDisconnection: { in: ["Yes", "yes"] } }
            ]
          }
        ]
      };
    } else {
      // If no filters, just get all requests with SIG disconnection
      whereCondition = {
        OR: [
          { sigDisconnection: { in: ["Yes", "yes"] } },
          { oheDisconnection: { in: ["Yes", "yes"] } },
          { ohDisconnection: { in: ["Yes", "yes"] } }
        ]
      };
    }
    
    // Get all requests with SIG disconnection
    const requests = await prisma.requests.findMany({
      where: whereCondition,
      select: {
        requestId: true,
        date: true,
        selectedDepartment: true,
        selectedDepo: true,
        sigDisconnection: true,
        oheDisconnection: true,
        ohDisconnection: true,
        managerId: true,
        userId: true,
        sigResponse: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all staging requests with SIG disconnection
    const stagingRequests = await prisma.stagingRequests.findMany({
      where: whereCondition,
      select: {
        requestId: true,
        date: true,
        selectedDepartment: true,
        selectedDepo: true,
        sigDisconnection: true,
        oheDisconnection: true,
        ohDisconnection: true,
        managerId: true,
        userId: true,
        sigResponse: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      filters: {
        department,
        depo
      },
      requests: {
        count: requests.length,
        data: requests
      },
      stagingRequests: {
        count: stagingRequests.length,
        data: stagingRequests
      }
    });
  } catch (error) {
    console.error("Error fetching SIG requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch SIG requests" },
      { status: 500 }
    );
  }
} 