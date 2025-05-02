"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function DebugPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerData, setManagerData] = useState(null);
  const [loadingManager, setLoadingManager] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/debug-database');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleManagerSearch = async () => {
    if (!managerEmail) return;
    
    try {
      setLoadingManager(true);
      const response = await fetch(`/api/debug-manager-user-relationship?email=${encodeURIComponent(managerEmail)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch manager data');
      }
      const result = await response.json();
      setManagerData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingManager(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      {session && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Current Session</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Manager Lookup</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
            placeholder="Enter manager email"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleManagerSearch}
            disabled={loadingManager}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loadingManager ? 'Loading...' : 'Search'}
          </button>
        </div>
        
        {managerData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Manager: {managerData.manager.name}</h3>
            <p>Department: {managerData.manager.department}</p>
            <p>ID: {managerData.manager.id}</p>
            
            <h4 className="text-md font-medium mt-4 mb-2">Users ({managerData.users.count})</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Department</th>
                    <th className="border p-2">Depot</th>
                  </tr>
                </thead>
                <tbody>
                  {managerData.users.data.map(user => (
                    <tr key={user.id}>
                      <td className="border p-2">{user.id}</td>
                      <td className="border p-2">{user.name}</td>
                      <td className="border p-2">{user.department}</td>
                      <td className="border p-2">{user.depot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <h4 className="text-md font-medium mt-4 mb-2">Staging Requests ({managerData.stagingRequests.count})</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="border p-2">Request ID</th>
                    <th className="border p-2">Department</th>
                    <th className="border p-2">User ID</th>
                    <th className="border p-2">Manager ID</th>
                    <th className="border p-2">Depot</th>
                    <th className="border p-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {managerData.stagingRequests.data.map(req => (
                    <tr key={req.requestId}>
                      <td className="border p-2">{req.requestId}</td>
                      <td className="border p-2">{req.selectedDepartment}</td>
                      <td className="border p-2">{req.userId || 'N/A'}</td>
                      <td className="border p-2">{req.managerId || 'N/A'}</td>
                      <td className="border p-2">{req.selectedDepo}</td>
                      <td className="border p-2">{new Date(req.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <h4 className="text-md font-medium mt-4 mb-2">Requests ({managerData.requests.count})</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="border p-2">Request ID</th>
                    <th className="border p-2">Department</th>
                    <th className="border p-2">User ID</th>
                    <th className="border p-2">Manager ID</th>
                    <th className="border p-2">Depot</th>
                    <th className="border p-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {managerData.requests.data.map(req => (
                    <tr key={req.requestId}>
                      <td className="border p-2">{req.requestId}</td>
                      <td className="border p-2">{req.selectedDepartment}</td>
                      <td className="border p-2">{req.userId || 'N/A'}</td>
                      <td className="border p-2">{req.managerId || 'N/A'}</td>
                      <td className="border p-2">{req.selectedDepo}</td>
                      <td className="border p-2">{new Date(req.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Users ({data.users.count})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Depot</th>
                </tr>
              </thead>
              <tbody>
                {data.users.data.map(user => (
                  <tr key={user.id}>
                    <td className="border p-2">{user.id}</td>
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.department}</td>
                    <td className="border p-2">{user.depot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Managers ({data.managers.count})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Department</th>
                </tr>
              </thead>
              <tbody>
                {data.managers.data.map(manager => (
                  <tr key={manager.id}>
                    <td className="border p-2">{manager.id}</td>
                    <td className="border p-2">{manager.name}</td>
                    <td className="border p-2">{manager.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Staging Requests ({data.stagingRequests.count})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border p-2">Request ID</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">User ID</th>
                <th className="border p-2">Manager ID</th>
                <th className="border p-2">Depot</th>
                <th className="border p-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.stagingRequests.data.map(req => (
                <tr key={req.requestId}>
                  <td className="border p-2">{req.requestId}</td>
                  <td className="border p-2">{req.selectedDepartment}</td>
                  <td className="border p-2">{req.userId || 'N/A'}</td>
                  <td className="border p-2">{req.managerId || 'N/A'}</td>
                  <td className="border p-2">{req.selectedDepo}</td>
                  <td className="border p-2">{new Date(req.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Requests ({data.requests.count})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border p-2">Request ID</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">User ID</th>
                <th className="border p-2">Manager ID</th>
                <th className="border p-2">Depot</th>
                <th className="border p-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.data.map(req => (
                <tr key={req.requestId}>
                  <td className="border p-2">{req.requestId}</td>
                  <td className="border p-2">{req.selectedDepartment}</td>
                  <td className="border p-2">{req.userId || 'N/A'}</td>
                  <td className="border p-2">{req.managerId || 'N/A'}</td>
                  <td className="border p-2">{req.selectedDepo}</td>
                  <td className="border p-2">{new Date(req.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 