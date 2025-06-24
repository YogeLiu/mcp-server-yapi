import { z } from "zod";

/**
 * 接口操作的全量字段Schema
 * 包含所有可能的接口字段和查询参数，各工具按需pick使用
 */
export const InterfaceSchema = z.object({
  // 基础标识
  id: z.number().int().positive().describe("接口ID"),

  // 基础信息
  title: z.string().min(1).max(100).describe("接口名称，长度1-100字符"),
  path: z.string().min(1).max(200).describe("API路径，必须以/开头"),
  method: z
    .enum(["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"])
    .describe("HTTP方法"),

  // 归属信息
  project_id: z.number().int().positive().describe("接口所属的YAPI项目ID"),
  catid: z.number().int().positive().describe("接口所属的分类ID"),

  // 状态和描述
  status: z
    .enum(["undone", "done"])
    .default("undone")
    .describe("接口状态，undone(开发中)或done(已完成)"),
  desc: z
    .string()
    .describe(
      "接口备注，html格式（提供给接口调用放的接口调用说明，一般包含接口描述、使用注意事项、特殊情况说明，各场景调用示例等）"
    ),

  // 请求相关
  req_headers: z
    .array(
      z.object({
        name: z.string().describe("参数名称"),
        value: z.string().describe("参数值"),
        example: z.string().describe("参数示例"),
        desc: z.string().describe("备注"),
      })
    )
    .optional()
    .describe("请求头"),
  req_params: z
    .array(
      z.object({
        name: z.string().describe("参数名称"),
        example: z.string().describe("示例"),
        desc: z.string().describe("备注"),
      })
    )
    .optional()
    .describe("path请求参数"),
  req_query: z
    .array(
      z.object({
        name: z.string().describe("参数名称"),
        required: z.enum(["0", "1"]).describe("是否必填"),
        example: z.string().describe("示例"),
        desc: z.string().describe("备注"),
      })
    )
    .optional()
    .describe("query请求参数"),
  // req_body_form: ?
  req_body_type: z
    .enum(["raw", "form", "json"])
    .describe("请求体类型 - raw(原始数据)、form(表单数据)、json(JSON数据)"),
  req_body_is_json_schema: z.boolean().describe("是否启用请求体JSON Schema"),
  req_body_other: z.string().describe("请求体Schema - JSON Schema格式"),

  // 响应相关
  res_body_type: z
    .enum(["json", "raw"])
    .default("json")
    .describe("响应体类型 - json(JSON格式)或raw(原始格式)"),
  res_body: z.string().describe("响应体Schema - JSON Schema格式"),
  res_body_is_json_schema: z.boolean().describe("是否启用响应体JSON Schema"),

  // 配置选项
  api_opened: z.boolean().describe("是否开放接口，传false即可"),
  switch_notice: z.boolean().describe("是否开启通知，传false即可"),

  // 查询参数
  page: z.number().int().min(1).optional().describe("页码 - 从1开始，默认1"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("每页数量 - 范围1-100，默认20"),
  tag: z.array(z.string()).optional().describe("标签"),

  // 分类相关
  name: z.string().min(1).max(50).describe("名称 - 长度1-50字符"),

  // 导入数据相关
  type: z
    .enum(["swagger"])
    .describe(
      "导入方式 - 仅支持swagger"
    ),
  merge: z
    .enum(["normal", "good", "merge"])
    .describe("数据同步方式 - normal(普通导入)、good(智能合并)、merge(强制合并)"),
  json: z
    .string()
    .optional()
    .describe(
      "JSON数据（可选）- 类型为序列化后的字符串，请勿传递 object"
    ),
  url: z
    .string()
    .url()
    .optional()
    .describe(
      "数据URL（可选）- 如果存在该参数，将会优先通过 url 方式获取数据"
    ),
});
