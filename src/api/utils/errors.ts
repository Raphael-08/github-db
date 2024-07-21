export function EmptyTableError(message: string) {
  return { name: "EmptyTableError", message };
}

export function UserMessedWithDBError(message: string) {
  return { name: "UserMessedWithDBError", message };
}

export function UnsuccessfulError(message: string) {
  return { name: "UnsuccessfulError", message };
}

export function NoDataUpdatedError(message: string) {
  return { name: "NoDataUpdatedError", message };
 }

export function NoDataDeletedError(message: string) {
  return { name: "NoDataDeletedError", message };
 }

export const ERRORS = {
  EmptyTableError,
  UserMessedWithDBError,
  UnsuccessfulError,
  NoDataUpdatedError,
  NoDataDeletedError,
};

/**
 * Creates a custom error object.
 *
 * @param {keyof typeof ERRORS} error - The type of error.
 * @param {string} message - The error message.
 * @returns {{ name: string, message: string }} - The custom error object.
 */
export function ErrorHandler(error: keyof typeof ERRORS, message: string) {
  return ERRORS[error](message);
}
