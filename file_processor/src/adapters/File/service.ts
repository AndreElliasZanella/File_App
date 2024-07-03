import {inject, injectable} from 'inversify';
import {Types} from '../../core/ports/types';
import ConsoleLogger from '../Logger/ConsoleLogger';
import {
    ListFilesRequest,
    DeleteFileRequest,
    PutFileRequest, IFileService,
} from "./ports";
import amqplib from 'amqplib';
import {FileSenderAdapter} from "../Sender/FileSenderAdapter";
import {FileModel} from "./model";

@injectable()
export class Service implements IFileService {
    private readonly queueName: string;
    private readonly rabbit_url: string;

    constructor(
        @inject(Types.Logger) private logger: ConsoleLogger,
        @inject(Types.FileSenderAdapter) private sender: FileSenderAdapter,
    ) {
        this.queueName = process.env.QUEUE || 'files';
        this.rabbit_url = process.env.RABBIT_URL || 'amqp://guest:guest@rabbitmq:5672/';
    }

    async delete(p: DeleteFileRequest): Promise<boolean> {
        try {
            await FileModel.findOneAndDelete({key: p.key});

            const response = await this.sender.delete(p.key);

            if (response) {
                this.logger.info(`Deleted file with key: ${p.key}`);
                return true;
            } else {
                return false
            }
        } catch (error) {
            this.logger.error(`Error deleting file: ${error}`);
            throw error;
        }
    }

    async list(p: ListFilesRequest): Promise<{data: string[], page: number, size: number}> {
        try {
            const files = await FileModel.find().skip((p.page - 1) * p.rate).limit(p.rate);
            const urls = files.map((file: { key: any; }) => ({url: file.key}));
            return {data: urls, page: p.page, size: p.rate};
        } catch (error) {
            this.logger.error(`Error listing files: ${error}`);
            throw error;
        }
    }

    async put(p: PutFileRequest, fileData: never): Promise<boolean> {
        try {
            const key = await this.sender.put(p.name, fileData);

            if (key) {
                const newFile = new FileModel({
                    key: key,
                    name: p.name,
                    type: p.type,
                    operation: p.operation
                });

                const savedFile = await newFile.save();
                this.logger.info(`Saved file with key: ${savedFile.key}`);

                await this.sendToQueue({
                    key: savedFile.key,
                    operation: savedFile.operation,
                });
                return true;
            } else {
                return false;
            }
        } catch (error) {
            this.logger.error(`Error putting file: ${error}`);
            throw error;
        }
    }

    private async sendToQueue(msg: { key: any; operation: any; }): Promise<void> {
        try {
            const connection = await amqplib.connect(this.rabbit_url);
            const channel = await connection.createChannel();
            await channel.assertQueue(this.queueName, {durable: true});

            const message = JSON.stringify(msg);
            await channel.sendToQueue(this.queueName, Buffer.from(message), {persistent: true});

            this.logger.info(`Sent message to queue: ${this.queueName}`);

            setTimeout(() => {
                channel.close();
                connection.close();
            }, 500);
        } catch (error) {
            this.logger.error(`Error sending message to queue: ${error}`);
            throw error;
        }
    }

}