// Helper to safely extract error message from unknown error types
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'Erro desconhecido';
};

export const isAuthError = (error: unknown, pattern: string): boolean => {
  const message = getErrorMessage(error);
  return message.includes(pattern);
};
