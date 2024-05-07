import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserUpdateDto } from './dto/updateUser.dto';
import { TokenDto } from '../token/dto/token.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { generateHash } from 'src/helpers/providers/hashProvider';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async isAdminUserExists(firstName: string) {
    const admin = await this.userRepository.findOne({
      where: { firstName: firstName },
    });
    return admin;
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { firstName: dto.firstName },
    });

    if (existingUser)
      throw new ConflictException(
        `User with name ${dto.firstName} already exists!`,
      );

    const hashedPassword = await generateHash(dto.password);
    dto.password = hashedPassword;
    const user = this.userRepository.create(dto);

    await this.userRepository.save(user);

    return {
      message: 'User created successful!',
    };
  }

  async getAllUsers() {
    const [users, count] = await this.userRepository.findAndCount({
      select: ['id', 'firstName', 'updatedAt', 'updatedAt'],
    });

    return {
      message: 'User returned successfully',
      users: users,
      usersCount: count,
    };
  }

  async findUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'createdAt', 'updatedAt', 'role'],
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return user;
  }

  async updateUserById(userId: string, userUpdateDto: UserUpdateDto) {
    const user = await this.findUserById(userId);
    if (userUpdateDto.password) {
      const hashedPassword = await generateHash(userUpdateDto.password);
      userUpdateDto.password = hashedPassword;
    }
    Object.assign(user, userUpdateDto);

    await this.userRepository.save(user);
    return {
      message: 'User updated successfully!',
      id: user.id,
      name: user.firstName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async deleteUserById(userId: string) {
    const user = await this.findUserById(userId);

    await this.userRepository.delete(user.id);
    return {
      message: 'User deleted successfully!',
    };
  }

  async getMe(currentUser: TokenDto) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });

    return {
      id: user.id,
      firstName: user.firstName,
      role: user.role,
    };
  }
}
