import {z} from "zod";

export const GetFileSchema =
    z.object({
        fileKey: z.string(),
    }).required();

export const PutFileSchema =
    z.object({
        fileKey: z.string(),
    }).required();

export const DeleteFileSchema =
    z.object({
        fileKey: z.string(),
    }).required();