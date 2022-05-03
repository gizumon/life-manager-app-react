export interface IErrorResponse {
  status: number;
  error: string;
  error_description?: string;
  code: string;
};

// TODO: Please match response status with this error response status.
export const errors = {
  VALIDATION_ERROR: (apiName: string, error_description = 'validation error') => ({
    status: 400,
    error: `[${apiName}] Failed to validate parameters`,
    code: 'VAL001',
    error_description,
  }),
  DB_ERROR: (apiName: string, error_description = 'db error') => ({
    status: 500,
    error: `[${apiName}] Failed to access db`,
    code: 'DB0001',
    error_description,
  }),
  API_ERROR: (apiName: string, error_description = 'api error') => ({
    status: 401,
    error: `[${apiName}] Failed to request API`,
    code: 'API001',
    error_description,
  }),
  NOT_FOUND_ERROR: (apiName: string, error_description = 'not found error') => ({
    status: 404,
    error: `[${apiName}] Not found`,
    code: 'CLIENT001',
    error_description,
  }),
};

export default errors;