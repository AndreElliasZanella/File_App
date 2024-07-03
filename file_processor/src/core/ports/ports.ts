import {Express} from "express";

export interface IHttpApp{
    listen(port: number): void;
    kill(): Promise<void>;
    getApp(): Express;
}