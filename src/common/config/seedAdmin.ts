import User from '../../modules/user/user.model';
import config from './config';
import logger from './logger';

export const seedAdmin = async () => {
    try {
        const adminCount = await User.countDocuments({ role: 'superadmin' });
        if (adminCount === 0) {
            await User.create({
                name: 'SuperAdmin',
                email: config.admin.email,
                password: config.admin.password,
                role: 'superadmin',
                isEmailVerified: true,
            });
            logger.info('SuperAdmin seeded successfully');
        }
    } catch (err) {
        logger.error('Error seeding admin:', err);
    }
};
