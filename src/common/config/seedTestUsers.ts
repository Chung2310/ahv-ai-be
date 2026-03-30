import User from '../../modules/user/user.model';
import logger from '../utils/logger';

export const seedTestUsers = async () => {
    try {
        // Tạo Admin thực nghiệm (dùng email khác admin@gmail.com vì đó là superadmin mặc định)
        const adminExist = await User.findOne({ email: 'admin-test@gmail.com' });
        if (!adminExist) {
            await User.create({
                name: 'Admin Test',
                email: 'admin-test@gmail.com',
                password: 'Admin@123',
                role: 'admin',
                isEmailVerified: true,
            });
            logger.info('Admin Test seeded successfully');
        }

        // Tạo User thực nghiệm
        const userExist = await User.findOne({ email: 'user@gmail.com' });
        if (!userExist) {
            await User.create({
                name: 'User Test',
                email: 'user@gmail.com',
                password: 'User@123',
                role: 'user',
                isEmailVerified: true,
            });
            logger.info('User Test seeded successfully');
        }
    } catch (err) {
        logger.error('Error seeding test users:', err);
    }
};
