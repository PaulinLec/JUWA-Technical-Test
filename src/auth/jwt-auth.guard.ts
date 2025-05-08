import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Get the request object from the context
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Check if the authorization header is present and valid
    if (!authHeader || authHeader !== 'Bearer my-super-secret-token') {
      throw new UnauthorizedException();
    }
    return true;
  }
}
