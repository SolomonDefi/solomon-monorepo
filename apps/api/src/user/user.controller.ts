import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { UserService } from './user.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

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
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 404,
    description: '',
  })
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    // TODO: Get user by Id.
  }

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 404,
    description: '',
  })
  @Post('/')
  addUser(@Param('id') id: string) {
    // TODO: Create user.
  }

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @Put('/:id')
  upsertUser(@Param('id') id: string) {
    // TODO: Upsert user.
  }

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @Delete('/:id')
  deleteUser() {
    // TODO: Delete user. Set as deleted rather then delete row.
  }
}
