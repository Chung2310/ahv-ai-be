import axios from 'axios';
import permissionsConfig from '../configs/permissions.json';
import routeDetail from '../configs/routeDetailForPermissions.json';

const BASE_URL = 'http://localhost:5005/api/v1';

async function login(email: string, pass: string) {
    try {
        // eslint-disable-next-line no-console
        console.log(`Debug Login for: ${email}`);
        const res = await axios.post(`${BASE_URL}/auths/login`, { email, password: pass });
        return res.data.data.tokens.access.token;
    } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } }; message: string };
        console.error(`Login failed for ${email}: ${axiosError.response?.data?.message || axiosError.message}`);
        return null;
    }
}

async function runTests() {
    // eslint-disable-next-line no-console
    console.log('🚀 Bắt đầu kiểm thử RBAC toàn diện...');

    const superAdminToken = await login('admin@gmail.com', 'Admin@123'); // SuperAdmin from .env
    const adminToken = await login('admin-test@gmail.com', 'Admin@123'); // Admin seeded just now
    const userToken = await login('user@gmail.com', 'User@123');

    const roles = ['user', 'admin', 'superadmin'];
    interface TestResult {
        role: string;
        permission: string;
        method: string;
        route: string;
        status: number;
        hasPermission: boolean;
        passed: boolean;
    }
    const results: TestResult[] = [];

    for (const roleName of roles) {
        const token = roleName === 'user' ? userToken : (roleName === 'admin' ? adminToken : superAdminToken);
        const rolePerms = permissionsConfig.find(p => p.role === roleName)?.permissions || [];
        
        // eslint-disable-next-line no-console
        console.log(`\n--- Testing Role: ${roleName} ---`);

        for (const [permKey, api] of Object.entries(routeDetail)) {
            const hasPermission = rolePerms.includes(permKey);
            
            // Thay thế các tham số mẫu trong route
            const testUrl = api.route
                .replace(':userId', '507f1f77bcf86cd799439011')
                .replace(':postId', '507f1f77bcf86cd799439011')
                .replace(':categoryId', '507f1f77bcf86cd799439011')
                .replace(':modelId', '507f1f77bcf86cd799439011')
                .replace(':taskId', '507f1f77bcf86cd799439011')
                .replace(':id', '507f1f77bcf86cd799439011');

            try {
                const res = await axios({
                    method: api.method,
                    url: `${BASE_URL}${testUrl}`,
                    headers: { Authorization: `Bearer ${token}` },
                    validateStatus: () => true,
                });

                // Nếu có quyền: status != 403
                // Nếu không có quyền: status == 403
                const passed = hasPermission ? res.status !== 403 : res.status === 403;

                results.push({
                    role: roleName,
                    permission: permKey,
                    method: api.method,
                    route: api.route,
                    status: res.status,
                    hasPermission,
                    passed
                });

                if (passed) {
                    process.stdout.write('✅');
                } else {
                    process.stdout.write('❌');
                    // eslint-disable-next-line no-console
                    console.log(`\n   FAILED RBAC: ${roleName} | ${permKey} | ${api.method} ${api.route} | Got ${res.status}, Expected ${hasPermission ? 'NOT 403' : '403'}`);
                }
            } catch {
                process.stdout.write('⚠️');
            }
        }
    }

    const total = results.length;
    const passedCount = results.filter(r => r.passed).length;
    // eslint-disable-next-line no-console
    console.log(`\n\n📊 TỔNG KẾT: ${passedCount}/${total} kịch bản thành công!`);
}

runTests();
