export interface IPaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

export interface IBaseResponse {
    success: boolean;
    message?: string;
}

export interface IApiResponse<T> extends IBaseResponse {
    data: T;
}

export interface IPaginatedResponse<T> extends IBaseResponse {
    data: T[];
    meta: IPaginationMeta;
}
