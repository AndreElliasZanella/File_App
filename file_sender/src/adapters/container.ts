import {Container} from "inversify";
import {Types} from "../core/ports/types";
import {HttpApplication} from "../handlers/HttpApplication";
import {FileController} from "../core/controllers/FileController";
import ConsoleLogger from "./Logger/ConsoleLogger";
import {LocalFileService} from "./FileService/LocalFileService";
import {AwsS3FileService} from "./FileService/AwsS3FileService";
import {IFileService} from "./FileService/ports";

const container = new Container();

const isDev = process.env.NODE_ENV === "dev";

container.bind(Types.HttpApplication).to(HttpApplication);
container.bind(Types.Logger).to(ConsoleLogger);
container.bind(Types.FileController).to(FileController);
container.bind<IFileService>(Types.FileService).to(isDev? LocalFileService : AwsS3FileService);
export default container;