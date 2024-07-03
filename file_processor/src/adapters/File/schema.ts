import {z, ZodTypeAny} from 'zod';

export const FileSchema = z.object({
    key: z.string().optional(),
    name: z.string(),
    type: z.enum(["png", "jpg", "jpeg"]),
    operation: z.enum(["hearts", "spades", "diamonds", "clubs"]),
});

export const PutFileSchema = FileSchema;

export const DeleteFileSchema = z.object({
    key: z.string(),
});

export const numericString = (schema: ZodTypeAny) => z.preprocess((a) => {
    if (typeof a === 'string') {
        return parseInt(a, 10)
    } else if (typeof a === 'number') {
        return a;
    } else {
        return undefined;
    }
}, schema);

export const ListFileSchema = z.object({
    rate: numericString(z.number()),
    page: numericString(z.number()),
});
