export interface IErrorResponse {
  status: number;
  error: string;
  error_description?: string;
  code: string;
};

namespace errors {
  export const DB_ERROR = (error_description = '') => ({
    status: 401,
    error: 'Failed to access db',
    code: 'DB0001',
    error_description,
  });
  export const API_ERROR = (error_description = '') => ({
    status: 401,
    error: 'Failed to request API',
    code: 'API001',
    error_description,
  });
}

export default errors;