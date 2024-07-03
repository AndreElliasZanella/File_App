import { inject, injectable } from "inversify";
import { Types } from "../../core/ports/types";
import ConsoleLogger from "../Logger/ConsoleLogger";
import axios from "axios";
import { IFileSenderAdapter } from "./ports";
import FormData from "form-data";
import { Readable } from 'stream';

const bufferToStream = (buffer: ArrayBufferLike) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
};

@injectable()
export class FileSenderAdapter implements IFileSenderAdapter {
    private readonly apiUrl: string;

    constructor(@inject(Types.Logger) private logger: ConsoleLogger) {
        this.apiUrl = process.env.FILE_SENDER_API || 'http://localhost:8082/';
    }

    async put(fileKey: string, fileData: Buffer): Promise<string | boolean> {
        try {
            const form = new FormData();
            const fileStream = bufferToStream(fileData.buffer);
            form.append('fileKey', fileKey);
            form.append('file', fileStream, {
                filename: fileKey,
                contentType: 'image/png'
            });

            const response = await axios.put(this.apiUrl, form, {
                headers: {
                    ...form.getHeaders(),
                }
            });

            return response.data.url;
        } catch (error) {
            this.logger.error(`Error putting file: ${error}`);
            return false;
        }
    }

    async delete(fileKey: string): Promise<boolean> {
        try {
            const response = await axios.delete(`${this.apiUrl}?fileKey=${fileKey}`);
            return response.status === 200;
        } catch (error) {
            this.logger.error(`Error deleting file: ${error}`);
            return false;
        }
    }
}
