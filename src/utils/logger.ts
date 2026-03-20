type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private readonly isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toISOString();
    
    let consoleMethod: typeof console.log;
    if (level === 'error') {
      consoleMethod = console.error;
    } else if (level === 'warn') {
      consoleMethod = console.warn;
    } else {
      consoleMethod = console.log;
    }
    
    consoleMethod(`[${timestamp}] [${level.toUpperCase()}]`, message, context || '');
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.log('error', message, errorContext);
  }
}

export const logger = new Logger();
