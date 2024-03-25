import {
  Body,
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
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { SuccessResponseMessage } from 'src/helpers/common/interfaces/successResponse.interface';
import { RootGuard } from 'src/helpers/guards/rootGuard.guard';

@ApiTags('users')
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBody({ type: CreateUserDto, description: 'Data to create user' })
  @ApiCreatedResponse({
    type: SuccessResponseMessage,
    description: 'User created',
  })
  @UseGuards(RootGuard)
  @Post('/create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiOkResponse({
    type: [UserEntity],
    description: 'Users returned successfully!',
  })
  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard)
  async findUsers() {
    return this.userService.getAllUsers();
  }

  @ApiOkResponse({
    type: UserEntity,
    description: 'Current user returned successfully!',
  })
  @ApiBearerAuth()
  @Get('/get-me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() currentUser: TokenDto) {
    return this.userService.getMe(currentUser);
  }

  @ApiOkResponse({
    type: UserEntity,
    description: 'User by id found',
  })
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @ApiBody({ type: UserUpdateDto, description: 'Data to update user' })
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
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'User ID' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.userService.deleteUserById(userId);
  }
}
