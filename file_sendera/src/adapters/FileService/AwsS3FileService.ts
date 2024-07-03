import { S3 } from 'aws-sdk';
import {inject, injectable} from "inversify";
import {Types} from "../../core/ports/types";
import ConsoleLogger from "../Logger/ConsoleLogger";
import {IFileService} from "./ports";

@injectable()
export class AwsS3FileService implements IFileService{
    private readonly bucketName: string;
    private readonly regionName: string;
    private readonly client: S3;

    constructor(
            @inject(Types.Logger) private logger: ConsoleLogger,
        ) {
        this.client = new S3({ region: this.regionName });
        this.bucketName = process.env.BUCKET_URL;
        this.regionName = process.env.AWS_REGION;
    }

    async get(fileKey: string): Promise<Buffer | null> {
        try {
            const response = await this.client.getObject({ Bucket: this.bucketName, Key: fileKey }).promise();
            return response.Body as Buffer;
        } catch (error) {
            this.logger.error(`Error getting file: ${error}`);
            return null;
        }
    }

    async put(fileKey: string, fileData: Buffer): Promise<string|boolean> {
        try {
            await this.client.putObject({ Bucket: this.bucketName, Key: fileKey, Body: Buffer.from(fileData.buffer) }).promise();
            return fileKey;
        } catch (error) {
            this.logger.error(`Error putting file: ${error}`);
            return false;
        }
    }

    async delete(fileKey: string): Promise<boolean> {
        try {
            await this.client.deleteObject({ Bucket: this.bucketName, Key: fileKey }).promise();
            return true;
        } catch (error) {
            this.logger.error(`Error deleting file: ${error}`);
            return false;
        }
    }
}
