#!/usr/bin/env node
import { MCPServer, logger } from "mcp-framework";
import { fileURLToPath } from "url";
import path from "path";
import { initializeConfig } from "./config.js";

/**
 * MCP Server 主入口点
 *
 * 该函数负责：
 * 1. 加载和验证配置
 * 2. 初始化MCP服务器
 * 3. 自动发现tools目录下的所有工具
 * 4. 启动服务器
 */
async function main() {
  try {
    // 定义 __filename 和 __dirname（ES modules 需要）
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // 输出版本信息（从环境变量或默认值获取）
    const name = process.env.npm_package_name || "mcp-server-yapi";
    const version = process.env.npm_package_version || "unknown";
    logger.info(`📦 MCP Server 版本: ${name}@${version}`);
    logger.info("🚀 MCP Server 启动中...");

    // 1. 加载和验证配置（只在启动时执行一次）
    logger.info("🔧 加载配置...");
    initializeConfig();
    logger.info("✅ 配置加载成功");

    // 2. 初始化MCP服务器（自动发现工具）
    logger.info("🔍 初始化MCP服务器...");
    const server = new MCPServer({
      basePath: __dirname,
    });

    // 3. 启动服务器
    logger.info("🎯 启动MCP服务器...");
    await server.start();

    // Handle shutdown
    process.on("SIGINT", async () => {
      logger.info("📢 MCP服务接收到关闭通知...");
      await server.stop();
      logger.info("👋 MCP服务已关闭");
    });
  } catch (error) {
    logger.error("❌ 启动失败: " + error);
    process.exit(1);
  }
}

// 启动服务器
main().catch((error) => {
  logger.error("❌ 未捕获的异常:" + error);
  process.exit(1);
});
