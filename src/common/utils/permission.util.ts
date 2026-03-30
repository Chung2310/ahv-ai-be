import permissionsConfig from '../configs/permissions.json';
import apiDetail from '../configs/routeDetailForPermissions.json';
import { ApiPermission } from '../interfaces/permission.interface';
import logger from '../utils/logger';

interface PermissionConfig {
    role: string;
    permissions: string[];
}

interface ApiDetailContent {
    route: string;
    method: string;
}

/**
 * Lấy danh sách quyền từ tên vai trò.
 * @param role Tên vai trò (ví dụ: 'admin', 'user')
 * @returns Danh sách các chuỗi quyền (permissions)
 */
export function getPermissionsByRoleNames(role: string): string[] {
    try {
        const permissions: string[] = [];
        const rolePermissions = (permissionsConfig as PermissionConfig[]).find((r) => r.role === role)?.permissions;
        permissions.push(...(rolePermissions || []));
        return permissions;
    } catch (error: unknown) {
        logger.error(error);
        return [];
    }
}

type PermissionKey = keyof typeof apiDetail;

/**
 * Chuyển đổi danh sách quyền sang danh sách các API tương ứng.
 * @param permissions Danh sách các chuỗi quyền
 * @returns Danh sách ApiPermission (route, method)
 */
export function getApisByPermissions(permissions: string[]): ApiPermission[] {
    try {
        const apis: ApiPermission[] = [];

        permissions.forEach((perm) => {
            const api = (apiDetail as Record<string, ApiDetailContent>)[perm as PermissionKey];

            if (api) {
                apis.push({
                    route: api.route,
                    method: api.method.toUpperCase(),
                });
            }
        });

        return apis;
    } catch (error) {
        logger.error(`getApisByPermissions error: ${error}`);
        return [];
    }
}

/**
 * Thay thế các tham số trong route (ví dụ: /users/:userId).
 */
export function replaceRouteParam(paramKey: string, paramValue: string, path: string): string {
    try {
        const resolvedPath = path.replace(paramKey, paramValue);
        return resolvedPath ?? path;
    } catch (error: unknown) {
        logger.error(error);
        return path;
    }
}

/**
 * Kiểm tra xem đường dẫn và phương thức hiện tại có nằm trong danh sách API cho phép không.
 * @param apis Danh sách API cho phép
 * @param fullPath Đường dẫn đầy đủ (URL)
 * @param method Phương thức HTTP (GET, POST, ...)
 * @returns true nếu hợp lệ, false nếu bị chặn
 */
export function checkPermissionsPath(apis: ApiPermission[], fullPath: string, method: string): boolean {
    try {
        const reqMethod = method.toUpperCase();

        // Chuẩn hóa path: loại bỏ /api/v1 ở đầu nếu có
        const normalizedPath = fullPath.replace(/^\/api\/v1/, '');

        return apis.some((api) => {
            // Hỗ trợ '*' cho tất cả các phương thức
            if (api.method !== '*' && api.method.toUpperCase() !== reqMethod) return false;

            // Chuyển đổi route pattern sang regex (ví dụ: /users/:userId -> ^/users/[^/]+$)
            const routeRegex = new RegExp('^' + api.route.replace(/\//g, '\\/').replace(/:[^/]+/g, '[^/]+') + '\\/?$');

            return routeRegex.test(normalizedPath);
        });
    } catch (error: unknown) {
        logger.error(error);
        return false;
    }
}
