import { MCPTool, MCPInput } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';
import { InterfaceStatus } from '../types/yapi-types.js';

const ListCategoryInterfacesSchema = z.object({
  catid: z.number().int().positive()
    .describe('分类ID - 要查询的分类ID，可通过get_category_menu获取项目下所有分类'),
  page: z.number().int().positive()
    .describe('页码 - 分页查询的页码，从1开始，默认为1'),
  limit: z.number().int().positive().max(100)
    .describe('每页数量 - 每页返回的接口数量，范围1-100，默认20'),
  status: z.enum(['done', 'undone']).optional()
    .describe('接口状态过滤（可选）- done(已完成)或undone(开发中)。不提供则返回所有状态的接口')
});

class ListCategoryInterfaces extends MCPTool {
  name = 'list_category_interfaces';
  description = `获取指定分类下的接口列表，支持分页和状态过滤。

⚡ 使用说明：
- 必需参数：catid(分类ID)
- 可选参数：page(页码，默认1)、limit(每页数量，默认20)、status(状态过滤)
- 支持分页查询，便于处理大量接口
- 支持按接口状态过滤（开发中/已完成）
- 返回接口的基本信息，包含ID、名称、路径等

📋 完整参数说明：
- catid: 分类ID，必需，可通过get_category_menu获取项目下所有分类
- page: 页码，可选，从1开始，默认1
- limit: 每页数量，可选，范围1-100，默认20
- status: 接口状态过滤，可选，done(已完成)或undone(开发中)

📊 返回信息：
- 分页信息：总数量、当前页码、每页数量
- 接口列表：每个接口包含ID、标题、路径、HTTP方法、状态、更新时间
- 分类信息：显示所属分类的基本信息

💡 使用场景：
- 查看特定分类下的所有接口
- 按分类管理和浏览接口
- 统计分类下接口的开发状态
- 获取分类接口ID用于详细查询

🔧 API详情：GET /api/interface/list_cat
📝 实现状态：已调用真实API，支持完整分页和状态过滤功能

💡 最佳实践：
- 先使用get_category_menu获取所有分类和ID
- 建议设置合理的limit避免数据量过大
- 结合status过滤查看不同开发阶段的接口
- 获取接口ID后使用get_interface查看详情

⚠️ 重要提示：
- 必须提供有效的分类ID
- 返回的是接口摘要信息，详细配置需要调用get_interface
- 支持状态过滤，便于分类管理接口开发进度`;
  schema = ListCategoryInterfacesSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);

    const requestParams = {
      ...input,
      status: input.status as InterfaceStatus | undefined,
    };

    return await yapiService.listCategoryInterfaces(requestParams);
  }
}

export default ListCategoryInterfaces; 