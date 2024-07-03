export interface IFileSenderAdapter {
    put(fileKey: string, fileData: Buffer): Promise<string|boolean>;
    delete(fileKey: string): Promise<NonNullable<unknown>>;
}