import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    return true
  }
}
