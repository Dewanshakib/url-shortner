import { Module } from "@nestjs/common";
import { UserController } from "./users.controller.js";
import { UserService } from "./users.service.js";


@Module({
    imports:[],
    controllers:[UserController],
    providers:[UserService],
    exports:[UserService]
})
export class UserModule {}