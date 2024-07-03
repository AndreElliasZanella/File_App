import express, {Express, NextFunction, Request, Response} from "express";
import {inject, injectable} from "inversify";
import dotenv from "dotenv";
import cors from "cors";
import {IHttpApp} from "../core/ports/ports";
import bodyParser from "body-parser";
import {Types} from "../core/ports/types";
import {FileController} from "../core/controllers/FileController";
import ConsoleLogger from "../adapters/Logger/ConsoleLogger";
import {ZodError} from "zod";
import { Server } from "http";
import { MongoError } from "mongodb";
import 'express-async-errors';
import multer from "multer"

dotenv.config();

@injectable()
export class HttpApplication implements IHttpApp {
    private _app: Express;
    private server: Server | null = null;
    private upload: multer;

    constructor(
        @inject(Types.FileController)
        private fileController: FileController,
        @inject(Types.Logger) private logger: ConsoleLogger
    ) {
        this._app = express();
        this._app.use(cors());
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({extended: false}));
        this.upload = multer();
        this.register();
    }

    listen(port: number): void {
        this.server = this._app.listen(port, () => {
            console.log(`listening on port http://localhost:${port}/`);
        });
    }

    async kill(): Promise<void> {
        if (this.server) {
            return new Promise<void>((resolve, reject) => {
                this.server.close((err) => {
                    if (err) {
                        this.logger.error(`Error during server shutdown: ${err.message}`);
                        reject(err);
                    } else {
                        this.logger.info('Server shut down gracefully.');
                        resolve();
                    }
                });
            });
        }
    }

    register(): void {
        this._app.get("/status", (req, res)=>{
            res.send("Healthy");
        });
        this._app.get("/", this.fileController.list.bind(this.fileController));
        this._app.post("/", this.upload.single('file'), this.fileController.insert.bind(this.fileController));
        this._app.delete("/", this.fileController.delete.bind(this.fileController));
        this._app.use("*", this.noRoute.bind(this));
        this._app.use((err, req, res, next) => {
            if (res.headersSent) {
                return next(err);
            }

            if (err instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    message: "Malformed request",
                    errors: err.errors
                });
                return;
            }

            if (err instanceof MongoError) {
                const mongoError = err;
                res.status(400).json({
                    success: false,
                    message: "Invalid operation",
                    errors: [{
                        code: mongoError.code,
                        message: mongoError.message,
                    }]
                });
                return;
            }

            this.logger.error(err.message);
            res.status(500).json("Internal server error");
        })
       }

    private noRoute(req: Request, res: Response, next: NextFunction): void {
        res.status(404).json({error: "Route not found"});
    }

    public getApp(): Express {
        return this._app;
    }

}
