"use client";

import { useRouter } from "next/navigation";

export default function UserTable() {
  const users = [
    {
      id: 1,
      name: "Huy",
      email: "huy@gmail.com",
      role: "Developer",
      tasks: 12,
      progress: 70,
    },
    {
      id: 2,
      name: "Lan",
      email: "lan@gmail.com",
      role: "Designer",
      tasks: 8,
      progress: 100,
    },
    {
      id: 3,
      name: "Minh",
      email: "minh@gmail.com",
      role: "Tester",
      tasks: 5,
      progress: 40,
    },
  ];
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-sm">
        {/* Table Header */}
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3 text-left font-medium">User</th>
            <th className="px-6 py-3 text-left font-medium">Role</th>
            <th className="px-6 py-3 text-left font-medium">Tasks</th>
            <th className="px-6 py-3 text-left font-medium">Progress</th>
            <th className="px-6 py-3 text-right font-medium">Action</th>
            <th className="px-6 py-3 text-left font-medium">Status</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 transition cursor-pointer"
              onClick={() => router.push(`/nhansu/${user.id}`)}
            >
              {/* User Info */}
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />

                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </td>

              {/* Role */}
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md">
                  {user.role}
                </span>
              </td>

              {/* Tasks */}
              <td className="px-6 py-4">{user.tasks}</td>

              {/* Progress */}
              <td className="px-6 py-4 w-48">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${user.progress}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-1">{user.progress}%</p>
              </td>

              {/* Action */}
              <td className="px-6 py-4 text-right">
                <button className="text-sm text-blue-600 hover:underline">
                  View
                </button>
              </td>
              {/* Status */}
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                  {user.progress === 100 ? "Completed" : "In Progress"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
