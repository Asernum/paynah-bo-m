import * as z from "zod"

export const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(7),
    sort: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    period: z.string().optional(),
    terminalId: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
})
