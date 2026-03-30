import { 
    getPermissionsByRoleNames, 
    getApisByPermissions, 
    checkPermissionsPath,
    replaceRouteParam
} from './permission.util';
import { ApiPermission } from '../interfaces/permission.interface';

describe('permission.util Utility', () => {
    describe('getPermissionsByRoleNames', () => {
        test('Nên trả về danh sách quyền cho vai trò hợp lệ', () => {
            const perms = getPermissionsByRoleNames('user');
            expect(Array.isArray(perms)).toBe(true);
            expect(perms).toContain('AUTH_ME');
        });

        test('Nên trả về mảng rỗng cho vai trò không tồn tại', () => {
            const perms = getPermissionsByRoleNames('non-existent-role');
            expect(perms).toEqual([]);
        });

        test('Nên bắt lỗi nếu role là undefined', () => {
            // Ép lỗi bằng tham số không hợp lệ
            const perms = getPermissionsByRoleNames(undefined as unknown as string);
            expect(perms).toEqual([]);
        });
    });

    describe('getApisByPermissions', () => {
        test('Nên chuyển đổi quyền thành ApiPermission hợp lệ', () => {
            const perms = ['AUTH_ME'];
            const apis = getApisByPermissions(perms);
            
            expect(apis.length).toBeGreaterThan(0);
            expect(apis[0]).toHaveProperty('route');
            expect(apis[0].method).toBe('GET');
        });

        test('Nên bỏ qua các quyền không hợp lệ', () => {
            const perms = ['INVALID_PERMISSION'];
            const apis = getApisByPermissions(perms);
            expect(apis).toEqual([]);
        });
    });

    describe('checkPermissionsPath', () => {
        const mockApis: ApiPermission[] = [
            { route: '/users/:userId', method: 'GET' },
            { route: '/posts', method: '*' },
            { route: '/tickets/:ticketId/status', method: 'PATCH' }
        ];

        test('Nên cho phép truy cập nếu khớp route và method', () => {
            const isAllowed = checkPermissionsPath(mockApis, '/users/12345', 'GET');
            expect(isAllowed).toBe(true);
        });

        test('Nên cho phép truy cập với method *', () => {
            const isAllowed = checkPermissionsPath(mockApis, '/posts', 'POST');
            expect(isAllowed).toBe(true);
        });

        test('Nên từ chối nếu sai method', () => {
            const isAllowed = checkPermissionsPath(mockApis, '/users/12345', 'POST');
            expect(isAllowed).toBe(false);
        });

        test('Nên từ chối nếu không khớp route', () => {
            const isAllowed = checkPermissionsPath(mockApis, '/other-route', 'GET');
            expect(isAllowed).toBe(false);
        });

        test('Nên xử lý tiền tố /api/v1', () => {
            const isAllowed = checkPermissionsPath(mockApis, '/api/v1/users/507', 'GET');
            expect(isAllowed).toBe(true);
        });

        test('Nên khớp route phức tạp với tham số', () => {
            const isAllowed = checkPermissionsPath(mockApis, '/api/v1/tickets/678/status', 'PATCH');
            expect(isAllowed).toBe(true);
        });
    });

    describe('Error Handling (Catch Blocks)', () => {
        test('replaceRouteParam nên trả về path gốc nếu lỗi', () => {
            // Ép lỗi bằng cách truyền null vào replace
            const result = replaceRouteParam(null as unknown as string, 'val', null as unknown as string);
            expect(result).toBeNull();
        });

        test('checkPermissionsPath nên trả về false nếu lỗi', () => {
            const result = checkPermissionsPath(null as unknown as ApiPermission[], '/path', 'GET');
            expect(result).toBe(false);
        });

        test('getApisByPermissions nên trả về mảng rỗng nếu lỗi', () => {
            const result = getApisByPermissions(null as unknown as string[]);
            expect(result).toEqual([]);
        });

    });
});
