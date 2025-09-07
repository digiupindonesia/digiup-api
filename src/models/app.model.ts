export interface DigiupApp {
    id: string;
    name: string;
    description: string;
    logo?: string | null;
    category: string; // Creation, Automation, Analytics, Collaboration
    status: string; // active, inactive, coming_soon
    appUrl?: string | null;
    features?: any[] | null; // JSON array of features
    tags: string[];
    isEarlyAccess: boolean;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAppRequest {
    name: string;
    description: string;
    logo?: string;
    category: string;
    status?: string;
    appUrl?: string;
    features?: any[];
    tags?: string[];
    isEarlyAccess?: boolean;
    sortOrder?: number;
}

export interface UpdateAppRequest {
    name?: string;
    description?: string;
    logo?: string;
    category?: string;
    status?: string;
    appUrl?: string;
    features?: any[];
    tags?: string[];
    isEarlyAccess?: boolean;
    sortOrder?: number;
    isActive?: boolean;
}

export interface AppResponse {
    success: boolean;
    message: string;
    data?: DigiupApp | DigiupApp[];
}
