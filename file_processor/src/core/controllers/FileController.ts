import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";
import {Types} from "../ports/types";
import {IFileService} from "../../adapters/File/ports";
import {DeleteFileSchema, ListFileSchema, PutFileSchema} from "../../adapters/File/schema";

interface FileRequest extends Request {
    file: never;
}

@injectable()
export class FileController {
    constructor(
        @inject(Types.FileService) private service: IFileService
    ) {}

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parsedQs = req.query;
            const decodedUri = decodeURIComponent(JSON.stringify(parsedQs));
            const parsedQuery = JSON.parse(decodedUri);
            const params = ListFileSchema.parse(parsedQuery);

            const request = await this.service.list(params);
            res.status(200).send(request);
        } catch (e) {
            next(e);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const parsedQs = req.query;
            const decodedUri = decodeURIComponent(JSON.stringify(parsedQs));
            const parsedQuery = JSON.parse(decodedUri);
            const params = DeleteFileSchema.parse(parsedQuery);

            const request = await this.service.delete(params);
            if (request) {
                res.status(200).send(request);
            } else {
                res.status(404).send(request);
            }
        } catch (e) {
            next(e);
        }
    }

    async insert(req: FileRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const file = PutFileSchema.parse(req.body);
            const fileData = req.file;

            if (!fileData) {
                res.status(400).send('No file uploaded');
                return;
            }

            const request = await this.service.put(file, fileData);
            if (request) {
                res.status(201).send(request);
            } else {
                res.status(400).send(request);
            }
        } catch (e) {
            next(e);
        }
    }
}
