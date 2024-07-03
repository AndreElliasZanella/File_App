import fs from 'fs';
import path from 'path';
import {inject, injectable} from 'inversify';
import {Types} from '../../core/ports/types';
import ConsoleLogger from '../Logger/ConsoleLogger';
import {IFileService} from "./ports";

@injectable()
export class LocalFileService implements IFileService {
    private readonly tmpFolder: string;

    constructor(
        @inject(Types.Logger) private logger: ConsoleLogger,
    ) {
        this.tmpFolder = '/tmp';
    }

    async get(fileKey: string): Promise<Buffer | null> {
        try {
            const filePath = path.join(this.tmpFolder, fileKey);
            return await fs.promises.readFile(filePath);
        } catch (error) {
            this.logger.error(`Error getting file: ${error}`);
            return null;
        }
    }

    async put(fileKey: string, fileData: Buffer): Promise<string|boolean> {
        try {
            const filePath = path.join(this.tmpFolder, fileKey);
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
            await fs.promises.writeFile(
                filePath,
                Buffer.from(fileData.buffer)
                );
            return fileKey;
        } catch (error) {
            this.logger.error(`Error putting file: ${error}`);
            return false;
        }
    }

    async delete(fileKey: string): Promise<boolean> {
        try {
            const filePath = path.join(this.tmpFolder, fileKey);
            await fs.promises.unlink(filePath);
            return true;
        } catch (error) {
            this.logger.error(`Error deleting file: ${error}`);
            return false;
        }
    }
}