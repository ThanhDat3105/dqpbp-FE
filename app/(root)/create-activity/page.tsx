"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
type Task = {
  title: string;
  assignee: string;
};

export default function CreateActivityPage() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tasks, setTasks] = useState<Task[]>([{ title: "", assignee: "" }]);
  const user = "ADMIN";
  const addTask = () => {
    setTasks([...tasks, { title: "", assignee: "" }]);
  };
  const handleChange = (
    index: number,
    field: "title" | "assignee",
    value: string,
  ) => {
    setTasks((prev) => {
      const newTasks = [...prev];
      newTasks[index] = {
        ...newTasks[index],
        [field]: value,
      };
      return newTasks;
    });
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Tạo kế hoạch</h1>

        <form className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên kế hoạch
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h2 className="font-semibold mb-2">Danh sách công việc</h2>

            {tasks.map((task, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Tên công việc"
                  name="job"
                  className="flex-1 border rounded-lg p-2"
                  value={task.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                />

                <input
                  type="text"
                  name="user"
                  placeholder="Người thực hiện"
                  className="flex-1 border rounded-lg p-2"
                  value={task.assignee}
                  onChange={(e) =>
                    handleChange(index, "assignee", e.target.value)
                  }
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addTask}
              className="mt-2 text-sm text-blue-600 cursor-pointer"
            >
              <AddIcon />
              Thêm công việc
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-olive text-white py-2 rounded-lg"
          >
            Tạo kế hoạch
          </button>
        </form>
        {/* Action buttons */}
        {user === "ADMIN" && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {/* Cancel */}
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Huỷ
            </button>

            {/* Create */}
            <button
              type="submit"
              disabled={!title || !startDate || !endDate}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold transition 
      ${
        !title || !startDate || !endDate
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-olive hover:bg-olive/90"
      }`}
            >
              <AddIcon fontSize="small" />
              Tạo kế hoạch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
