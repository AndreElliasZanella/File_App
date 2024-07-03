import {inject, injectable} from "inversify";
import {NextFunction, Request, Response} from "express";
import {IFileService} from "../../adapters/FileService/ports";
import {Types} from "../ports/types";
import {DeleteFileSchema, GetFileSchema, PutFileSchema} from "../../adapters/FileService/schema";
import path from "path";
import fs from "fs";
import {v4 as uuid} from 'uuid'

interface FileRequest extends Request {
    fileKey: string;
    file: Buffer;
}

@injectable()
export class FileController {
    constructor(
        @inject(Types.FileService) private fileService: IFileService
    ) {

    }

    async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fileKey } = GetFileSchema.parse(req.query);

            const fileData = await this.fileService.get(fileKey);
            if (fileData) {
                res.status(200).send(fileData);
            } else {
                res.status(404).send("File not found");
            }
        }catch (e){
            next(e);
        }
    }

    async serve(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fileKey } = GetFileSchema.parse(req.query);

            if (!fileKey) {
                res.status(400).send('File key is missing');
                return;
            }

            const fileData = await this.fileService.get(fileKey);
            if (!fileData) {
                res.status(404).send('File not found');
                return;
            }

            const tmpFolder = '/tmp';
            const filePath = path.join(tmpFolder, (uuid() + fileKey));

            try {
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                fs.writeFileSync(filePath, fileData);

                res.sendFile(filePath, () => {
                    fs.unlinkSync(filePath);
                });
            } catch (error) {
                console.error('Error serving file:', error);
                res.status(500).send('Internal Server Error');
            }
        }catch (e){
            next(e);
        }
    }

    async put(req: FileRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const {fileKey} = PutFileSchema.parse({fileKey: req.body.fileKey});
            let fileData = req.file?? req.body.file;

            if (!req.file){
                fileData = Buffer.from(fileData, 'binary');
            }

            if (!fileData) {
                res.status(400).send('No file uploaded');
                return;
            }

            const response = await this.fileService.put(fileKey, fileData);
            if (response) {
                res.status(200).send({url: response});
            } else {
                res.status(400).send("An error occurred while saving file");
            }
        }catch (e){
            next(e);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try{
            const {fileKey} = DeleteFileSchema.parse(req.query);

            await this.fileService.delete(fileKey);
            res.status(200).send("File deleted successfully");
        }
        catch (e) {
            next(e);
        }
    }
}
