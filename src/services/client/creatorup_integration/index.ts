import creatorupRegisterService from './creatorup_register_service';
import creatorupLoginService from './creatorup_login_service';
import CreatorUpAuthService from './creatorup_auth_service';
import CreatorUpCredentialsService from './creatorup_credentials_service';

export default {
    register: creatorupRegisterService,
    login: creatorupLoginService,
    auth: CreatorUpAuthService,
    credentials: CreatorUpCredentialsService,
};
