/**
 * Logging levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

/**
 * Simple logger with support for levels and structured data
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;

  /**
   * Create a new logger
   * @param options Logger configuration
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.prefix = options.prefix || 'KOTA';
  }

  /**
   * Set the logging level
   * @param level The level to set
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Set the log prefix
   * @param prefix The prefix to use
   */
  public setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * Log at debug level
   * @param message The message to log
   * @param data Optional structured data
   */
  public debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log at info level
   * @param message The message to log
   * @param data Optional structured data
   */
  public info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log at warning level
   * @param message The message to log
   * @param data Optional structured data
   */
  public warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log at error level
   * @param message The message to log
   * @param data Optional structured data
   */
  public error(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Internal logging implementation
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (level < this.level) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const formattedData = data ? ` ${JSON.stringify(data)}` : '';

    const logMessage = `[${timestamp}] [${this.prefix}] [${levelName}] ${message}${formattedData}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
    }
  }
}
