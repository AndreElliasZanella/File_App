#!/usr/bin/node
import "reflect-metadata";
import container from "../src/adapters/container";
import { Types } from "../src/core/ports/types";
import { HttpApplication } from "../src/handlers/HttpApplication";
import { connect } from "../src/adapters/DataBase/db";

const port = process.env.PORT || 8080;

(async () => {
    try {
        const app = container.get<HttpApplication>(Types.HttpApplication)
        await connect();
        app.listen(Number(port));
    } catch (error) {
        console.log(error);
    }
})();
