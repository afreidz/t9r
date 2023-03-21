import { z } from "zod";

const ProjectSchema = z
  .object({
    _id: z.string().optional(),
    owner: z.string().optional(),
    name: z.string().min(2).max(30),
    budget: z.number().min(1).optional().nullable(),
    archived: z.boolean().optional().default(false),
    defaultTitle: z.string().min(2).max(30).optional(),
    hideInReport: z.boolean().optional().default(false),
    defaultUtilized: z.boolean().optional().default(true),
    color: z.string().regex(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/),
  })
  .passthrough();

export default ProjectSchema;
export type Project = z.infer<typeof ProjectSchema>;
