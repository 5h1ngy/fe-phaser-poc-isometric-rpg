/**
 * Utility class for logging debug messages with a consistent format and optional data payload.
 */
export class DebugLogger {
    /**
     * Logs a formatted debug message to the console.
     * 
     * @param method - The name of the method or context generating the log.
     * @param message - The debug message to log.
     * @param data - Optional data to log alongside the message.
     */
    static log(method: string, message: string, data?: any): void {
        const color = 'color: cyan';
        console.log(`%c[Debug::${method}] ${message}`, color);
        if (data) {
            console.log(`%c[Debug::${method}] Data:`, color, data);
        }
    }
}
