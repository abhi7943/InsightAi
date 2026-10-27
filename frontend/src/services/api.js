import axios from 'axios';


const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000/api',

  timeout: 60000,
});


// ---------------------------------------------------------
// Request Interceptor
// ---------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('insightai_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ---------------------------------------------------------
// Response Interceptor
// ---------------------------------------------------------

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    // -----------------------------------------------------
    // Backend is unreachable
    // -----------------------------------------------------

    if (!error.response) {
      error.userMessage =
        'Unable to reach InsightAI. Check that the backend is running and try again.';

      return Promise.reject(error);
    }


    const status = error.response.status;
    const data = error.response.data;


    // -----------------------------------------------------
    // Unauthorized
    // -----------------------------------------------------

    if (status === 401) {

      localStorage.removeItem('insightai_token');
      localStorage.removeItem('insightai_user');

      error.userMessage =
        data?.detail ||
        'Your session has expired. Please sign in again.';

      return Promise.reject(error);
    }


    // -----------------------------------------------------
    // File too large
    // -----------------------------------------------------

    if (status === 413) {

      error.userMessage =
        data?.detail ||
        'The uploaded file is too large.';

      return Promise.reject(error);
    }


    // -----------------------------------------------------
    // Server errors
    // -----------------------------------------------------

    if (status >= 500) {

      error.userMessage =
        data?.detail ||
        'InsightAI is temporarily unavailable. Please try again.';

      return Promise.reject(error);
    }


    // -----------------------------------------------------
    // Client errors
    // -----------------------------------------------------

    if (status >= 400) {

      error.userMessage =
        data?.detail ||
        'The request could not be completed.';

      return Promise.reject(error);
    }


    return Promise.reject(error);
  }
);


// ---------------------------------------------------------
// Get Friendly API Error Message
// ---------------------------------------------------------

export function getApiErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.'
) {

  if (error?.userMessage) {
    return error.userMessage;
  }


  if (!error?.response) {

    return (
      'Unable to reach InsightAI. ' +
      'Check that the backend is running and try again.'
    );
  }


  return (
    error.response.data?.detail ||
    fallback
  );
}


export default api;