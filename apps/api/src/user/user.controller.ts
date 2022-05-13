import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { UserDto } from '@solomon/shared/util-klass'
import { validate } from 'class-validator'
import { loggerService } from '@solomon/shared/service-logger'
import { AdminGuard } from '../auth/admin.guard'

@Controller({
  path: '/user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 403,
    description: '',
  })
  @Get()
  getUsers() {
    // TODO: Get all users, with paging and sorting. Admin only.
  }

  @ApiOperation({
    summary: 'Get user by id',
    description: 'Get user by id.',
  })
  @ApiResponse({
    status: 200,
    description: 'Get user success.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @Get('/:id')
  async getUserById(@Param('id') id: string, @Res() res: Response) {
    try {
      let userResult = await this.userService.getUserById(id)

      if (!userResult) {
        return res.status(404).json({
          message: 'User not found',
        })
      }

      return res.status(200).send(userResult)
    } catch (err) {
      return res.status(500).json({
        message: 'Get user error',
        error: err,
      })
    }
  }

  @ApiOperation({
    summary: 'Add public user',
    description: 'Add public user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request.',
  })
  @Post('/')
  async addPublicUser(@Body() userDto: UserDto, @Res() res: Response) {
    let validateError = await validate(new UserDto(userDto))

    if (validateError.length > 0) {
      loggerService.error(validateError)
      return res.status(400).json({
        message: 'Invalid request',
        error: validateError,
      })
    }

    try {
      await this.userService.addPublicUser(userDto)
    } catch (err) {
      loggerService.error(err)
      return res.status(500).json({
        message: 'Add public user error',
        error: err,
      })
    }

    res.status(201).send()
  }

  @ApiOperation({
    summary: 'Add admin user',
    description: 'Add admin user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request.',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied.',
  })
  @Post('/admin')
  @UseGuards(AdminGuard)
  async addAdminUser(@Body() userDto: UserDto, @Res() res: Response) {
    let validateError = await validate(new UserDto(userDto))

    if (validateError.length > 0) {
      loggerService.error(validateError)
      return res.status(400).json({
        message: 'Invalid request',
        error: validateError,
      })
    }

    try {
      await this.userService.addAdminUser(userDto)
    } catch (err) {
      loggerService.error(err)
      return res.status(500).json({
        message: 'Add admin user error',
        error: err,
      })
    }

    res.status(201).send()
  }

  @ApiOperation({
    summary: 'Update user',
    description: 'Update exist user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Update success.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request.',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied',
  })
  @Put('/')
  async updateUser(@Body() userDto: UserDto, @Res() res: Response) {
    let validateError = await validate(new UserDto(userDto))

    if (validateError.length > 0) {
      loggerService.error(validateError)
      return res.status(400).json({
        message: 'Invalid request',
        error: validateError,
      })
    }

    try {
      await this.userService.updateUser(userDto)
    } catch (err) {
      loggerService.error(err)
      return res.status(500).json({
        message: 'Update user error',
        error: err,
      })
    }

    return res.status(200).send()
  }

  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Delete user success.',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied',
  })
  @Delete('/:id')
  @UseGuards(AdminGuard)
  async deleteUserById(@Param() id: string, @Res() res: Response) {
    try {
      await this.userService.deleteUserById(id)
    } catch (err) {
      loggerService.error(err)
      return res.status(500).json({
        message: 'Delete user error',
        error: err,
      })
    }

    return res.status(200).send()
  }
}
