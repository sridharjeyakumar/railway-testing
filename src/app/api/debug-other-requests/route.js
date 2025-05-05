import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
export const dynamic = 'force-dynamic'
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const depo = searchParams.get('depo');
    
    if (!department || !depo) {
      return NextResponse.json(
        { error: "Department and depo are required parameters" },
        { status: 400 }
      );
    }
    
    // Get user information if available
    let user = null;
    const email = searchParams.get('email');
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          department: true,
          depot: true
        }
      });
    }
    
    // Build the query conditions exactly as in getOtherRequests
    let whereCondition = {};

    if (department === "SIG") {
      // SIG users see requests with SIG disconnection from their depo
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
    } else if (department === "ENGG") {
      // ENGG users see their own requests with SIG disconnection
      whereCondition = {
        AND: [
          { selectedDepartment: "ENGG" },
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
      // Other departments see requests with SIG disconnection from their depo
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
    }
    
    // Get all requests matching the conditions
    const requests = await prisma.requests.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all requests with SIG disconnection for this depo
    const allSigRequests = await prisma.requests.findMany({
      where: {
        selectedDepo: depo,
        OR: [
          { sigDisconnection: { in: ["Yes", "yes"] } },
          { oheDisconnection: { in: ["Yes", "yes"] } },
          { ohDisconnection: { in: ["Yes", "yes"] } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all ENGG requests with SIG disconnection for this depo
    const enggSigRequests = await prisma.requests.findMany({
      where: {
        selectedDepartment: "ENGG",
        selectedDepo: depo,
        OR: [
          { sigDisconnection: { in: ["Yes", "yes"] } },
          { oheDisconnection: { in: ["Yes", "yes"] } },
          { ohDisconnection: { in: ["Yes", "yes"] } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all requests for this depo
    const allDepoRequests = await prisma.requests.findMany({
      where: {
        selectedDepo: depo
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      user,
      parameters: {
        department,
        depo
      },
      query: {
        condition: whereCondition
      },
      results: {
        filteredRequests: {
          count: requests.length,
          data: requests
        },
        allSigRequests: {
          count: allSigRequests.length,
          data: allSigRequests
        },
        enggSigRequests: {
          count: enggSigRequests.length,
          data: enggSigRequests
        },
        allDepoRequests: {
          count: allDepoRequests.length
        }
      }
    });
  } catch (error) {
    console.error("Error debugging other requests:", error);
    return NextResponse.json(
      { error: "Failed to debug other requests" },
      { status: 500 }
    );
  }
} 