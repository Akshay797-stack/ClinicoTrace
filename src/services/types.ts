// ============================================================
// ClinicoTrace — Service Layer Shared Types
// Clean boundaries between service calls and domain types.
// ============================================================

export interface ServiceResult<T> {
  success: true;
  data: T;
}

export interface ServiceError {
  success: false;
  error: string;
  code: ServiceErrorCode;
}

export type ServiceResponse<T> = ServiceResult<T> | ServiceError;

export type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'EXTRACTION_FAILED'
  | 'SAFETY_ENGINE_UNAVAILABLE'
  | 'AUTHORIZATION_DENIED'
  | 'INTERNAL_ERROR';

export function ok<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

export function err(error: string, code: ServiceErrorCode = 'INTERNAL_ERROR'): ServiceError {
  return { success: false, error, code };
}
