import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/updateUser.dto';
import { CurrentUser } from '../../helpers/common/decorators/currentUser.decorator';
import { TokenDto } from '../token/dto/token.dto';
import { AuthGuard } from '../../helpers/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { RootGuard } from 'src/helpers/guards/rootGuard.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User created successful!' },
      },
    },
    description: 'User created',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'User with name  already exists!',
  })
  // @UseGuards(RootGuard)
  @Post('/create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User returned successfully',
        },
        users: { items: { $ref: getSchemaPath(UserEntity) } },
        usersCount: { type: 'number' },
      },
    },
    description: 'Users returned successfully!',
  })
  @Get()
  @UseGuards(AuthGuard)
  async findUsers() {
    return this.userService.getAllUsers();
  }

  @ApiOkResponse({
    type: UserEntity,
    description: 'Current user returned successfully!',
  })
  @Get('/get-me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() currentUser: TokenDto) {
    return this.userService.getMe(currentUser);
  }

  @ApiOkResponse({
    type: UserEntity,
    description: 'User by id found',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOneUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userService.findUserById(userId);
  }

  @ApiOkResponse({
    type: UserEntity,
    description: 'User by id found',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() userUpdateDto: UserUpdateDto,
  ) {
    return this.userService.updateUserById(userId, userUpdateDto);
  }

  @ApiOkResponse({
    description: 'User by id deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully!' },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userService.deleteUserById(userId);
  }
}
