import express, {Express, NextFunction, Request, Response} from "express";
import {inject, injectable} from "inversify";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer"
import {IHttpApp} from "../core/ports/ports";
import bodyParser from "body-parser";
import {Types} from "../core/ports/types";
import {FileController} from "../core/controllers/FileController";
import ConsoleLogger from "../adapters/Logger/ConsoleLogger";
import 'express-async-errors';
import {ZodError} from "zod";

dotenv.config();

@injectable()
export class HttpApplication implements IHttpApp {
    private app: Express;
    private upload: multer;

    constructor(
        @inject(Types.FileController)
        private fileController: FileController,
        @inject(Types.Logger) private logger: ConsoleLogger
    ) {
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.upload = multer();
        this.register();
    }

    listen(port: number): void {
        this.app.listen(port, () => {
            console.log(`listening on port http://localhost:${port}/`);
        });
    }

    register(): void {
        this.app.get("/status", (req, res)=>{
            res.send("Healthy");
        });        this.app.get("/", this.fileController.get.bind(this.fileController));
        this.app.put("/", this.upload.single('file'), this.fileController.put.bind(this.fileController));
        this.app.delete("/", this.fileController.delete.bind(this.fileController));
        this.app.get("/resource", this.fileController.serve.bind(this.fileController));
        this.app.use("*", this.noRoute.bind(this));
        this.app.use(this.error.bind(this));
    }

    private noRoute(req: Request, res: Response, next: NextFunction): void {
        res.status(404).json({error: "Route not found"});
    }

    private error(err: Error, req: Request, res: Response, next: NextFunction): void {
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

        this.logger.error(err.message);
        res.status(500).json("Internal server error");
    }
}
