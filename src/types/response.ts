//TODO: Add a description to this file

/**
 * Standard response format for API resources
 * Based on Google API Style Guide
 */
export interface ResourceResponse<T> {
  status: "success";
  code: number;
  message: string;
  data: T;
}

export interface ResourcesResponse<T> {
  status: "success";
  code: number;
  message: string;
  data: T[];
  metadata?: {
    itemsPerPage: number;
    currentItemCount: number;
    currentPage: number;
    startIndex: number;
    totalItems: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface ErrorResponse {
  status: "error";
  code: number;
  message: string;
  errors?: string[];
}
