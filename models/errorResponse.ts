export interface IErrorResponse {
  status: number;
  error: string;
  error_description?: string;
  code: string;
};

export const errors = {
  DB_ERROR: (error_description = '') => ({
    status: 401,
    error: 'Failed to access db',
    code: 'DB0001',
    error_description,
  }),
  API_ERROR: (error_description = '') => ({
    status: 401,
    error: 'Failed to request API',
    code: 'API001',
    error_description,
  }),
  NOT_FOUND_ERROR: (error_description = '') => ({
    status: 404,
    error: 'Not found',
    code: 'CLIENT001',
    error_description,
  }),
};

export default errors;