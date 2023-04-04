import { Body, Controller, Post } from '@nestjs/common';
import { RegistrationReqModel } from 'src/models/registration.req.model/registration.req.model';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor (private userService:UsersService) {}

    @Post('register')
    async userRegistration(@Body() regPayload: RegistrationReqModel){
        return await this.userService.userRegistration(regPayload);
    }
}
