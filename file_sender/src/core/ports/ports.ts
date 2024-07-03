import express from "express";

export interface IHttpApp{
    listen(port: number): void;
}

export interface IRouter{
    register(): void;
    middleware(): express.RequestHandler;
}