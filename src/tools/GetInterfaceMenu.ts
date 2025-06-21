import { MCPTool, MCPInput } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';

const GetInterfaceMenuSchema = z.object({
  project_id: z.number().int().positive()
    .describe('项目ID - 要获取接口菜单的YAPI项目ID。返回完整的树形菜单结构，包含所有分类和接口的层级关系')
});

class GetInterfaceMenu extends MCPTool {
  name = 'get_interface_menu';
  description = `获取YAPI项目的完整接口菜单树，以树形结构展示所有分类和接口。

⚡ 使用说明：
- 必需参数：project_id(项目ID)
- 获取项目的完整接口组织结构
- 以树形菜单形式展示分类和接口的层级关系
- 包含每个分类下的所有接口列表
- 提供项目接口的完整导航视图

📋 完整参数说明：
- project_id: 项目ID，必需，可通过get_project获取当前项目ID

📊 返回信息：
- 树形菜单结构：分类作为节点，接口作为叶子
- 分类信息：每个分类的ID、名称、描述、接口数量
- 接口摘要：每个接口的ID、名称、路径、HTTP方法、状态
- 层级关系：清晰的父子级组织结构

💡 使用场景：
- 了解项目的整体接口架构
- 快速导航和定位特定接口
- 分析项目的接口组织方式
- 获取完整的分类和接口ID映射

🔧 API详情：GET /api/interface/list_menu
📝 实现状态：已调用真实API，返回完整的树形菜单结构

💡 最佳实践：
- 用于项目接口的全局概览
- 配合get_interface获取接口详细信息
- 用于理解项目的接口分类逻辑
- 适合作为接口浏览的起始点

⚠️ 重要提示：
- 返回的是完整的项目接口结构，数据量可能较大
- 包含所有分类和接口的基本信息
- 适合用于构建接口导航和目录结构`;
  schema = GetInterfaceMenuSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);
    return await yapiService.getInterfaceMenu(input);
  }
}

export default GetInterfaceMenu; 