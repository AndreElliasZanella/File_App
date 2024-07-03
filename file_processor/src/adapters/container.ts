import {Container} from "inversify";
import {Types} from "../core/ports/types";
import {HttpApplication} from "../handlers/HttpApplication";
import {FileController} from "../core/controllers/FileController";
import ConsoleLogger from "./Logger/ConsoleLogger";
import {FileSenderAdapter} from "./Sender/FileSenderAdapter";
import {Service} from "./File/service";

var container = new Container();

container.bind(Types.HttpApplication).to(HttpApplication);
container.bind(Types.Logger).to(ConsoleLogger);
container.bind(Types.FileController).to(FileController);
container.bind(Types.FileSenderAdapter).to(FileSenderAdapter);
container.bind(Types.FileService).to(Service);
export default container;