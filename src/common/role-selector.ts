import { Role } from '@prisma/client';

export const adminRoles: Role[] = [Role.ADMIN, Role.SUPER_ADMIN, Role.READER];

export const designerRoles: Role[] = [Role.DESIGNER, Role.DESIGNER_ADMIN];

export const publisherRoles: Role[] = [Role.PUBLISHER, Role.PUBLISHER_ADMIN];
