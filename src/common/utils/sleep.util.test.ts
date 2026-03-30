import { sleep } from './sleep.util';

describe('sleep Utility', () => {
    test('Nên đợi đúng khoảng thời gian được chỉ định', async () => {
        const start = Date.now();
        const ms = 100;
        await sleep(ms);
        const end = Date.now();
        const duration = end - start;

        expect(duration).toBeGreaterThanOrEqual(ms - 10); // Cho phép sai số nhỏ của scheduler
        expect(duration).toBeLessThan(ms + 50);
    });
});
