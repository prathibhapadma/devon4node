import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { Configuration } from '../configuration/configuration.enum';
import { ConfigurationService } from '../configuration/configuration.service';
import { SignOptions, sign } from 'jsonwebtoken';
import { JwtPayload } from './jwt-payload';
import { User } from '../../user/models/user.entity';
import { UserVm } from '../../user/models/view-models/user-vm.model';

@Injectable()
export class AuthService {
  private readonly jwtOptions: SignOptions;
  private readonly jwtKey: string | undefined;

  constructor(
    @Inject(forwardRef(() => UserService)) readonly _userService: UserService,
    private readonly _configurationService: ConfigurationService,
  ) {
    this.jwtOptions = { expiresIn: '12h' };
    this.jwtKey = _configurationService.get(Configuration.JWT_KEY);
  }

  async signPayload(payload: JwtPayload): Promise<string> {
    return sign(payload, this.jwtKey, this.jwtOptions);
  }
  async validatePayload(payload: JwtPayload): Promise<User | null> {
    const username = payload.username;
    return await this._userService.find({ username }).catch(err => {
      return null;
    });
  }

  async getUser(payload: JwtPayload): Promise<UserVm | null> {
    const username = payload.username;
    return await this._userService
      .find({ username })
      .then(user => {
        const { id, ...result } = user;
        return result as UserVm;
      })
      .catch(err => {
        return null;
      });
  }
}
