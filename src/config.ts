import { z } from "zod";
import { logger } from "mcp-framework";

/**
 * YAPI配置接口定义
 */
export interface YapiConfig {
  /** YAPI服务器基础URL */
  baseUrl: string;
  /** YAPI访问令牌 */
  token: string;
  /** 请求超时时间（毫秒） */
  timeout: number;
  /** 调试模式 */
  debug: boolean;
}

/**
 * 全局配置实例
 */
let globalConfig: YapiConfig | null = null;

/**
 * 环境变量验证模式
 */
const ConfigSchema = z.object({
  YAPI_BASE_URL: z.string().url("YAPI_BASE_URL必须是有效的URL"),
  YAPI_TOKEN: z.string().min(1, "YAPI_TOKEN不能为空"),
  YAPI_TIMEOUT: z.string().optional().default("10000"),
  DEBUG: z.string().optional().default("false"),
});

/**
 * 加载和验证配置
 * @returns {YapiConfig} 验证后的配置对象
 * @throws {Error} 当配置验证失败时抛出错误
 */
export function loadConfig(): YapiConfig {
  try {
    // 验证环境变量
    const env = ConfigSchema.parse(process.env);

    // 解析超时时间
    const timeout = parseInt(env.YAPI_TIMEOUT, 10);
    if (isNaN(timeout) || timeout <= 0) {
      throw new Error("YAPI_TIMEOUT必须是大于0的数字");
    }

    // 构建配置对象
    const config: YapiConfig = {
      baseUrl: env.YAPI_BASE_URL.replace(/\/$/, ""), // 移除末尾斜杠
      token: env.YAPI_TOKEN,
      timeout,
      debug: env.DEBUG.toLowerCase() === "true",
    };

    // 调试输出
    logger.debug(
      `🔧 YAPI配置加载成功: baseUrl=${config.baseUrl}, token=${config.token}, timeout=${config.timeout}`
    );

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(`配置验证失败:\n${messages.join("\n")}`);
    }
    throw error;
  }
}

/**
 * 初始化配置（在应用启动时调用）
 * @throws {Error} 当配置验证失败时抛出错误
 */
export function initializeConfig(): void {
  globalConfig = loadConfig();
}

/**
 * 获取全局配置
 * @returns {YapiConfig} 全局配置对象
 * @throws {Error} 当配置未初始化时抛出错误
 */
export function getConfig(): YapiConfig {
  if (!globalConfig) {
    throw new Error("配置未初始化，请先调用 initializeConfig()");
  }
  return globalConfig;
}

/**
 * 验证配置有效性
 * @param config 配置对象
 * @returns true表示配置有效
 */
export function validateConfig(config: YapiConfig): boolean {
  return !!(
    config.baseUrl &&
    config.token &&
    typeof config.timeout === "number" &&
    config.timeout > 0
  );
}
