import z from "zod";

export default z.object({
    name: z.string().min(3, 'Name must have at least 3 characters')
});