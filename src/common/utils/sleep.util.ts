/**
 * Tạm dừng thực thi trong một khoảng thời gian
 * @param ms Số miligiây cần chờ
 * @returns Promise
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
