import {
    DeleteFileSchema, ListFileSchema,
    PutFileSchema
} from "./schema";
import {z} from "zod";

export type PutFileRequest = z.infer<typeof PutFileSchema>;
export type DeleteFileRequest = z.infer<typeof DeleteFileSchema>;
export type ListFilesRequest = z.infer<typeof ListFileSchema>;

export interface IFileService {
    put(p: PutFileRequest, fileData: never): Promise<boolean>;
    list(p: ListFilesRequest): Promise<{data: string[], page: number, size: number}>;
    delete(p: DeleteFileRequest): Promise<boolean>;
}
