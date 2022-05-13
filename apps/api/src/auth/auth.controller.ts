import { Body, Controller, Get, Post, Res } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Response } from 'express'

@Controller({
  path: '/auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login',
    description: 'Login and get JWT.',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 403,
    description: 'Email or password error.',
  })
  @Post('/login')
  async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
    const email = body.email
    const password = body.password
    const jwt = await this.authService.getJWT(email, password)

    if (jwt === null) {
      return res.status(403).json({
        message: 'Auth fail, email or password error.',
      })
    }

    return res.status(200).json({
      jwt: jwt,
    })
  }
}
