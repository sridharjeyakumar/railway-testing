import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const depo = searchParams.get('depo');
    const sigDisconnection = searchParams.get('sigDisconnection');
    
    // Build the query conditions
    let whereCondition = {};
    
    // Add filters if provided
    if (department) {
      whereCondition.selectedDepartment = department;
    }
    
    if (depo) {
      whereCondition.selectedDepo = depo;
    }
    
    if (sigDisconnection) {
      whereCondition.sigDisconnection = sigDisconnection;
    }
    
    // Get all requests from the requests table
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
    
    // Count requests with SIG disconnection
    const sigDisconnectionCount = requests.filter(req => 
      req.sigDisconnection === "Yes" || req.sigDisconnection === "yes"
    ).length;
    
    // Count requests with OHE disconnection
    const oheDisconnectionCount = requests.filter(req => 
      req.oheDisconnection === "Yes" || req.oheDisconnection === "yes" || 
      req.ohDisconnection === "Yes" || req.ohDisconnection === "yes"
    ).length;

    return NextResponse.json({
      filters: {
        department,
        depo,
        sigDisconnection
      },
      totalCount: requests.length,
      sigDisconnectionCount,
      oheDisconnectionCount,
      requests: requests
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
} 