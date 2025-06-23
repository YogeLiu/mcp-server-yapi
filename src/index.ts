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
    // 动态确定项目根目录并切换
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(currentDir, "..");
    process.chdir(projectRoot);

    logger.info("🚀 MCP Server 启动中...");

    // 1. 加载和验证配置（只在启动时执行一次）
    logger.info("🔧 加载配置...");
    initializeConfig();
    logger.info("✅ 配置加载成功");

    // 2. 初始化MCP服务器（自动发现工具）
    logger.info("🔍 初始化MCP服务器...");
    const server = new MCPServer();

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
