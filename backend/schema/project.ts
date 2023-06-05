import { z } from "zod";

const ProjectSchema = z.object({
  _id: z.string().optional(),
  owner: z.string().optional(),
  name: z.string().min(2).max(30),
  deleted: z.boolean().optional().default(false),
  budget: z.number().min(1).optional().nullable(),
  archived: z.boolean().optional().default(false),
  defaultTitle: z.string().min(2).max(30).optional(),
  defaultUtilized: z.boolean().optional().default(true),
  icon: z.string().min(0).max(4).optional().nullable().default(null),
  color: z
    .string()
    .regex(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/)
    .optional()
    .default("#6B7280"),
  color2: z
    .string()
    .regex(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/)
    .nullable()
    .optional(),
  color3: z
    .string()
    .regex(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/)
    .nullable()
    .optional(),
});

export default ProjectSchema;
export type Project = z.infer<typeof ProjectSchema>;
