import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken, createClerkClient } from '@clerk/clerk-sdk-node';
import { ROLES_KEY } from '../../domain/decorators/roles.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
    } catch (error) {
      this.logger.error('Error verificando firma del token de Clerk:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Por defecto Clerk NO incluye publicMetadata en el JWT a menos que se configure
    // en el dashboard. Para no complicar la configuración, lo traemos por API.
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(decodedToken.sub);
    const userRole = user.publicMetadata?.role;

    const hasRole = requiredRoles.some((role) => userRole === role);

    if (!hasRole) {
      throw new ForbiddenException(`Acceso denegado. Requiere rol(es): ${requiredRoles.join(', ')}`);
    }

    request.user = { 
      id: decodedToken.sub, 
      role: userRole,
      email: user.emailAddresses[0]?.emailAddress || `user_${decodedToken.sub}@quizsync.local`,
      firstName: user.firstName || 'Usuario',
      lastName: user.lastName || ''
    };
    return true;
  }
}
