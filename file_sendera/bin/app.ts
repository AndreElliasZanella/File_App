#!/usr/bin/node
import "reflect-metadata";
import container from "../src/adapters/container";
import { Types } from "../src/core/ports/types";
import { HttpApplication } from "../src/handlers/HttpApplication";

const port = process.env.PORT || 3000;

(() => {
    try {
        const app = container.get<HttpApplication>(Types.HttpApplication)
        app.listen(Number(port));
    } catch (error) {
        console.log(error);
    }
})();
