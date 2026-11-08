import { Role } from "../entities/Role";

export function compareRol(role: string | null | undefined, is: Role): boolean {
  if (!role) return false;

  const normalizedRole = role.trim().toUpperCase();
  const roleAliases: Record<string, Role> = {
    EMPLEADO: Role.EMPLOYEE,
    ENCARGADO: Role.MANAGER,
    ADMINISTRADOR: Role.ADMIN,
    PENDIENTE: Role.WAITING,
    ESPERANDO: Role.WAITING
  };

  return (roleAliases[normalizedRole] ?? normalizedRole) === is;
}
