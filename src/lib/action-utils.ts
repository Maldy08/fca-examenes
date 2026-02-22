export type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export function successResponse<T>(data?: T): ActionResponse<T> {
    return { success: true, data };
}

export function errorResponse(error: string): ActionResponse<never> {
    return { success: false, error };
}
