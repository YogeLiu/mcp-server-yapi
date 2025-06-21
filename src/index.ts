import { MCPServer, logger } from "mcp-framework";
import { fileURLToPath } from "url";
import path from "path";

/**
 * MCP Server 主入口点
 *
 * 该函数负责：
 * 1. 初始化MCP服务器
 * 2. 自动发现tools目录下的所有工具
 * 3. 启动服务器
 */
async function main() {
  try {
    // 动态确定项目根目录并切换
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(currentDir, "..");
    process.chdir(projectRoot);

    logger.info("🚀 MCP Server 启动中...");

    // 初始化MCP服务器（自动发现工具）
    const server = new MCPServer({
      name: "mcp-server-yapi", // Default: package.json name or "unnamed-mcp-server"
      version: "0.0.1", // Default: package.json version or "0.0.0"
    });

    // 启动服务器
    await server.start();

    // Handle shutdown
    process.on("SIGINT", async () => {
      logger.info("MCP服务接收到关闭通知...")
      await server.stop();
    });
  } catch (error) {
    logger.error("❌ 启动失败:" + error);
    process.exit(1);
  }
}

// 启动服务器
main().catch((error) => {
  logger.error("❌ 未捕获的异常:" + error);
  process.exit(1);
});
