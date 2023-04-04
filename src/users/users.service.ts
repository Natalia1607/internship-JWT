import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegistrationReqModel } from 'src/models/registration.req.model/registration.req.model';
import { RegistrationRespModel } from 'src/models/registration.resp.model/registration.resp.model';
import { Repository } from 'typeorm';
import { User } from './users';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private user:Repository<User>) {}
    private async registrationValidations(regPayload: RegistrationReqModel): Promise<string> {
        if(!regPayload.email){
            return "Email can't be empty";
        }

        const emailRule = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if(!emailRule.test(regPayload.email.toLocaleLowerCase())) {
            return "Invalid email format";
        }

        if(regPayload.password !== regPayload.confirmPassword) {
            return "Confirm password must match with password";
        }

        let user = await this.user.findOneBy({ email: regPayload.email });
        if(user != null && user.userId > 0) {
            return "User already exist";        
        }

        return "";
    }

    private async getPasswordHash(password:string):Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    public async userRegistration(regPayload: RegistrationReqModel):Promise<RegistrationRespModel> {
        let result = new RegistrationRespModel();

        const errorMessage = await this.registrationValidations(regPayload);
        if(errorMessage){
            result.status = false,
            result.message = errorMessage;
            return result;
        }

        let newUser = new User();
        newUser.email = regPayload.email;
        newUser.firstName = regPayload.firstName;
        newUser.lastName = regPayload.lastName;
        newUser.password = await this.getPasswordHash(regPayload.password);

        this.user.insert(newUser);

        result.status = true;
        result.message = "success";
    }
}
