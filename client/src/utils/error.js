export const extractErrorMessage = (err, fallback = 'Something went wrong') => {
  if (err?.response?.data?.errors?.length) {
    return err.response.data.errors.map((e) => e.msg).join(', ');
  }
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message) return err.message;
  return fallback;
};

