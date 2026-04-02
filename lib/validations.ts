import { z } from 'zod';

// Report Field schema
const reportFieldSchema = z.object({
  name: z.string()
    .min(1, { message: 'Tên hạng mục báo cáo là bắt buộc' }),
  value: z.string().optional().default('')
});

// Task schema
const taskSchema = z.object({
  title: z.string()
    .min(1, { message: 'Tên nhiệm vụ là bắt buộc' })
    .min(3, { message: 'Tên nhiệm vụ phải có ít nhất 3 ký tự' }),
  team: z.string()
    .min(1, { message: 'Tổ phụ trách là bắt buộc' }),
  assignees: z.array(z.string())
    .min(1, { message: 'Phải chọn ít nhất một người thực hiện' }),
  dueDate: z.string()
    .min(1, { message: 'Thời hạn hoàn thành là bắt buộc' })
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Thời hạn phải là ngày hợp lệ' }
    ),
  notes: z.string().optional().default(''),
  reportFields: z.array(reportFieldSchema).default([]),
  accepted_at: z.date().nullable().optional().default(null),
  completed: z.boolean().default(false),
  created_at: z.date().or(z.string()),
  updated_at: z.date().or(z.string())
});

// Activity schema with validation
export const createActivitySchema = z.object({
  name: z.string()
    .min(1, { message: 'Tên kế hoạch là bắt buộc' })
    .min(3, { message: 'Tên kế hoạch phải có ít nhất 3 ký tự' }),
  work_group: z.string()
    .min(1, { message: 'Tổ công tác là bắt buộc' }),
  work_type: z.string()
    .min(1, { message: 'Loại hoạt động là bắt buộc' }),
  department: z.string()
    .min(1, { message: 'Tổ phụ trách là bắt buộc' }),
  location: z.string()
    .min(1, { message: 'Địa điểm là bắt buộc' }),
  document_number: z.string().optional().default(''),
  attached_files: z.array(z.string()).default([]),
  start_date: z.date().or(z.string()),
  end_date: z.date().or(z.string()),
  tasks: z.array(taskSchema).default([]),
  created_by: z.string()
    .min(1, { message: 'Người tạo là bắt buộc' }),
  created_at: z.string()
    .min(1, { message: 'Ngày tạo là bắt buộc' }),
  updated_at: z.string()
    .min(1, { message: 'Ngày cập nhật là bắt buộc' })
}).refine(
  (data) => {
    const startDate = typeof data.start_date === 'string'
      ? new Date(data.start_date)
      : data.start_date;
    const endDate = typeof data.end_date === 'string'
      ? new Date(data.end_date)
      : data.end_date;
    return endDate >= startDate;
  },
  {
    message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
    path: ['end_date']
  }
).refine(
  (data) => {
    const startDate = typeof data.start_date === 'string'
      ? new Date(data.start_date)
      : data.start_date;
    return data.tasks.every(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= startDate;
    });
  },
  {
    message: 'Thời hạn của nhiệm vụ phải sau hoặc bằng ngày bắt đầu kế hoạch',
    path: ['tasks']
  }
);

// Inferred types
export type CreateActivityFormData = z.infer<typeof createActivitySchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type ReportFieldFormData = z.infer<typeof reportFieldSchema>;
