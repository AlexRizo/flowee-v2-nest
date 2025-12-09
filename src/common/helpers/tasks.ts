import { TaskPriority, TaskStatus, TaskType } from '@prisma/client';

enum EspTaskType {
  PRINT = 'Impresa',
  DIGITAL = 'Digital',
  ECOMMERCE = 'Ecommerce',
  SPECIAL = 'Especial',
  UNKNOWN = 'Desconocida',
}

export const getTaskType = (type: TaskType): EspTaskType => {
  switch (type) {
    case TaskType.DIGITAL:
      return EspTaskType.DIGITAL;
    case TaskType.ECOMMERCE:
      return EspTaskType.ECOMMERCE;
    case TaskType.PRINT:
      return EspTaskType.PRINT;
    case TaskType.SPECIAL:
      return EspTaskType.SPECIAL;
    default:
      return EspTaskType.UNKNOWN;
  }
};

enum EspPriority {
  LOW = 'Baja',
  NORMAL = 'Normal',
  HIGH = 'Alta',
  URGENT = 'Urgente',
  UNKNOWN = 'Desconocida',
}

export const getTaskPriority = (priority: TaskPriority): EspPriority => {
  switch (priority) {
    case TaskPriority.LOW:
      return EspPriority.LOW;
    case TaskPriority.NORMAL:
      return EspPriority.NORMAL;
    case TaskPriority.HIGH:
      return EspPriority.HIGH;
    case TaskPriority.URGENT:
      return EspPriority.URGENT;
    default:
      return EspPriority.UNKNOWN;
  }
};

export const getTaskStatus = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.PENDING:
      return 'Pendiente';
    case TaskStatus.ATTENTION:
      return 'Atención';
    case TaskStatus.IN_PROGRESS:
      return 'En progreso';
    case TaskStatus.FOR_REVIEW:
      return 'Para revisión';
    case TaskStatus.DONE:
      return 'Hecho';
    default:
      return 'Desconocido';
  }
};
