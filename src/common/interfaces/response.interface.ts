export interface ResponseFormat<T> {
    success: boolean;
    data: T | null;
    timestamp: string;
    error?: {
        statusCode: number;
        message: string;
        path: string;
        method: string;
    };
}
