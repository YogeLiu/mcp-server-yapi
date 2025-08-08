import { z } from "zod";
import { logger } from "mcp-framework";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * 单个项目配置接口
 */
export interface ProjectConfig {
  /** YAPI服务器基础URL */
  baseUrl: string;
  /** YAPI访问令牌 */
  token: string;
}

/**
 * YAPI多项目配置接口定义
 */
export interface YapiConfig {
  /** 项目配置映射：项目名 -> 项目配置 */
  projects: Record<string, ProjectConfig>;
  /** 默认项目名 */
  defaultProject?: string;
}

/**
 * 全局配置实例
 */
let globalConfig: YapiConfig | null = null;

/**
 * 环境变量验证模式 - 支持旧版单项目配置
 */
const LegacyConfigSchema = z.object({
  YAPI_BASE_URL: z.string().url("YAPI_BASE_URL必须是有效的URL"),
  YAPI_TOKEN: z.string().min(1, "YAPI_TOKEN不能为空"),
});

/**
 * 环境变量验证模式 - 新版多项目配置
 */
const MultiProjectConfigSchema = z.object({
  YAPI_PROJECTS: z.string().min(1, "YAPI_PROJECTS不能为空").optional(),
  YAPI_PROJECTS_FILE: z.string().min(1, "YAPI_PROJECTS_FILE不能为空").optional(),
  YAPI_DEFAULT_PROJECT: z.string().optional(),
});

/**
 * 加载和验证配置
 * @returns {YapiConfig} 验证后的配置对象
 * @throws {Error} 当配置验证失败时抛出错误
 */
export function loadConfig(): YapiConfig {
  try {
    // 尝试加载多项目配置
    if (process.env.YAPI_PROJECTS || process.env.YAPI_PROJECTS_FILE) {
      return loadMultiProjectConfig();
    }
    
    // 回退到单项目配置（向后兼容）
    return loadLegacyConfig();
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
 * 加载多项目配置
 */
function loadMultiProjectConfig(): YapiConfig {
  const env = MultiProjectConfigSchema.parse(process.env);
  
  let projectsConfig: Record<string, ProjectConfig>;
  
  // 优先从文件加载
  if (env.YAPI_PROJECTS_FILE) {
    try {
      const filePath = resolve(env.YAPI_PROJECTS_FILE);
      if (!existsSync(filePath)) {
        throw new Error(`配置文件不存在: ${filePath}`);
      }
      const fileContent = readFileSync(filePath, 'utf8');
      projectsConfig = JSON.parse(fileContent);
      logger.debug(`🔧 从文件加载项目配置: ${filePath}`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`配置文件JSON格式错误: ${env.YAPI_PROJECTS_FILE}`);
      }
      throw error;
    }
  } else if (env.YAPI_PROJECTS) {
    // 从环境变量加载（向后兼容）
    try {
      projectsConfig = JSON.parse(env.YAPI_PROJECTS);
      logger.debug("🔧 从环境变量加载项目配置");
    } catch (error) {
      throw new Error("YAPI_PROJECTS必须是有效的JSON格式");
    }
  } else {
    throw new Error("必须设置 YAPI_PROJECTS_FILE 或 YAPI_PROJECTS");
  }
  
  // 验证项目配置结构
  const projects: Record<string, ProjectConfig> = {};
  for (const [projectName, config] of Object.entries(projectsConfig)) {
    if (!config || typeof config !== 'object') {
      throw new Error(`项目 ${projectName} 配置无效`);
    }
    
    const projectConfig = config as any;
    if (!projectConfig.baseUrl || !projectConfig.token) {
      throw new Error(`项目 ${projectName} 缺少必需的 baseUrl 或 token`);
    }
    
    projects[projectName] = {
      baseUrl: projectConfig.baseUrl.replace(/\/$/, ""),
      token: projectConfig.token,
    };
  }
  
  const yapiConfig: YapiConfig = {
    projects,
    defaultProject: env.YAPI_DEFAULT_PROJECT,
  };
  
  logger.debug(
    `🔧 多项目YAPI配置加载成功: ${Object.keys(projects).length}个项目, 默认项目: ${yapiConfig.defaultProject || '未设置'}`
  );
  
  return yapiConfig;
}

/**
 * 加载单项目配置（向后兼容）
 */
function loadLegacyConfig(): YapiConfig {
  const env = LegacyConfigSchema.parse(process.env);
  
  const projectConfig: ProjectConfig = {
    baseUrl: env.YAPI_BASE_URL.replace(/\/$/, ""),
    token: env.YAPI_TOKEN,
  };
  
  const yapiConfig: YapiConfig = {
    projects: {
      default: projectConfig
    },
    defaultProject: 'default',
  };
  
  logger.debug(
    `🔧 单项目YAPI配置加载成功: baseUrl=${projectConfig.baseUrl}, token=${projectConfig.token}`
  );
  
  return yapiConfig;
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
 * 获取指定项目的配置
 * @param projectName 项目名，如果不指定则使用默认项目
 * @returns {ProjectConfig} 项目配置对象
 * @throws {Error} 当项目不存在时抛出错误
 */
export function getProjectConfig(projectName?: string): ProjectConfig {
  const config = getConfig();
  
  const targetProject = projectName || config.defaultProject;
  if (!targetProject) {
    throw new Error("未指定项目名且没有默认项目");
  }
  
  const projectConfig = config.projects[targetProject];
  if (!projectConfig) {
    const availableProjects = Object.keys(config.projects).join(', ');
    throw new Error(`项目 '${targetProject}' 不存在。可用项目: ${availableProjects}`);
  }
  
  return projectConfig;
}

/**
 * 获取所有可用项目名列表
 * @returns {string[]} 项目名列表
 */
export function getAvailableProjects(): string[] {
  const config = getConfig();
  return Object.keys(config.projects);
}

/**
 * 验证配置有效性
 * @param config 配置对象
 * @returns true表示配置有效
 */
export function validateConfig(config: YapiConfig): boolean {
  return !!(config.projects && Object.keys(config.projects).length > 0);
}
