export class DebugLogger {
    static log(method: string, message: string, data?: any) {
        const color = 'color: cyan';
        console.log(`%c[Debug::${method}] ${message}`, color);
        if (data) console.log(`%c[Debug::${method}] Data:`, color, data);
    }
}
