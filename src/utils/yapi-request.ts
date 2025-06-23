import fetch from "node-fetch";
import { logger } from "mcp-framework";
import { getConfig } from "../config.js";

/**
 * YAPI API响应接口
 */
export interface YapiResponse<T = any> {
  /** 错误码，0表示成功 */
  errcode: number;
  /** 错误消息 */
  errmsg: string;
  /** 响应数据 */
  data: T;
}

/**
 * 通用请求头
 */
const COMMON_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "User-Agent": "YAPI-MCP-Client/1.0.0",
} as const;

/**
 * 通用请求处理函数
 * @param url 请求URL
 * @param options fetch选项
 * @returns Promise<YapiResponse<T>>
 */
async function yapiRequest<T = any>(
  url: string,
  options: any
): Promise<YapiResponse<T>> {
  const config = getConfig();

  try {
    logger.debug(`[YAPI] 请求URL: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...COMMON_HEADERS,
        ...options.headers,
      },
      timeout: config.timeout,
    });

    if (!response.ok) {
      logger.error(
        `[YAPI] 响应错误: [${response.status}] ${await response.text()}`
      );
      throw new Error(
        `HTTP错误! status: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as YapiResponse<T>;
    logger.debug(`[YAPI] 响应: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    logger.error(`[YAPI] 请求失败: ${error}`);
    throw error;
  }
}

/**
 * 发送GET请求到YAPI
 * @param path API路径
 * @param params 查询参数
 * @returns Promise<YapiResponse<T>> 响应数据
 */
export async function yapiGet<T = any>(
  path: string,
  params: Record<string, any> = {}
): Promise<YapiResponse<T>> {
  const config = getConfig();

  // 添加token到查询参数
  const requestParams = {
    token: config.token,
    ...params,
  };

  // 过滤掉值为undefined的参数
  const filteredParams = Object.fromEntries(
    Object.entries(requestParams).filter(([_, value]) => value !== undefined)
  );

  // 构建URL
  const url = new URL(`${config.baseUrl}${path}`);
  Object.keys(filteredParams).forEach((key) =>
    url.searchParams.append(key, String(filteredParams[key]))
  );

  return yapiRequest<T>(url.toString(), {
    method: "GET",
  });
}

/**
 * 发送POST请求到YAPI
 * @param path API路径
 * @param data 请求体数据
 * @returns Promise<YapiResponse<T>> 响应数据
 */
export async function yapiPost<T = any>(
  path: string,
  data: Record<string, any> = {}
): Promise<YapiResponse<T>> {
  const config = getConfig();

  // 添加token到请求数据
  const requestData = {
    token: config.token,
    ...data,
  };

  const url = `${config.baseUrl}${path}`;

  logger.debug(`[YAPI] 请求数据: ${JSON.stringify(requestData)}`);

  return yapiRequest<T>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
}
