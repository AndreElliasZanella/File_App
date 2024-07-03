export interface IFileService{
    get(fileKey: string): Promise<Buffer | null>,
    put(fileKey: string, fileData: Buffer): Promise<string|boolean>,
    delete(fileKey: string): Promise<boolean>
}