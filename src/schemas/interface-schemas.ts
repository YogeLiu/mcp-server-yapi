import { z } from "zod";

/**
 * Complete field Schema for interface operations
 * Contains all possible interface fields and query parameters, each tool picks as needed
 */
export const InterfaceSchema = z.object({
  // Basic identifiers
  id: z.number().int().describe("Interface ID"),

  // Basic information
  title: z.string().min(1).max(100).describe("Interface name"),
  path: z.string().min(1).max(200).describe("API path, must start with /"),
  method: z
    .enum(["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"])
    .describe("HTTP method"),

  // Ownership information
  project_id: z.number().int().describe("YAPI project ID that the interface belongs to"),
  catid: z.number().int().describe("Category ID that the interface belongs to"),

  // Status and description
  status: z
    .enum(["undone", "done"])
    .default("undone")
    .describe("Interface status"),
  desc: z
    .string()
    .describe(
      "Interface remarks, html format (interface call instructions provided to interface callers, generally including interface description, usage notes, special situation explanations, call examples for various scenarios, etc.)"
    ),

  // Request related
  req_headers: z
    .array(
      z.object({
        name: z.string().describe("Parameter name"),
        value: z.string().describe("Parameter value"),
        example: z.string().describe("Parameter example"),
        desc: z.string().describe("Remarks"),
      })
    )
    .optional()
    .describe("Request headers"),
  req_params: z
    .array(
      z.object({
        name: z.string().describe("Parameter name"),
        example: z.string().describe("Example"),
        desc: z.string().describe("Remarks"),
      })
    )
    .optional()
    .describe("Path request parameters"),
  req_query: z
    .array(
      z.object({
        name: z.string().describe("Parameter name"),
        required: z.enum(["0", "1"]).describe("Whether required"),
        example: z.string().describe("Example"),
        desc: z.string().describe("Remarks"),
      })
    )
    .optional()
    .describe("Query request parameters"),
  // req_body_form: ?
  req_body_type: z
    .enum(["raw", "form", "json"])
    .describe("Request body type - raw(raw data), form(form data), json(JSON data)"),
  req_body_is_json_schema: z.boolean().describe("Whether to enable request body JSON Schema"),
  req_body_other: z.string().describe("Request body Schema - JSON Schema format"),

  // Response related
  res_body_type: z
    .enum(["json", "raw"])
    .default("json")
    .describe("Response body type - json(JSON format) or raw(raw format)"),
  res_body: z.string().describe("Response body Schema - JSON Schema format"),
  res_body_is_json_schema: z.boolean().describe("Whether to enable response body JSON Schema"),

  // Configuration options
  api_opened: z.boolean().describe("Whether to open the interface, pass false"),
  switch_notice: z.boolean().describe("Whether to enable notifications, pass false"),

  // Query parameters
  page: z.number().int().min(1).optional().describe("Page number - starts from 1, default 1"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Number per page - range 1-100, default 20"),
  tag: z.array(z.string()).optional().describe("Tags"),

  // Category related
  name: z.string().min(1).max(50).describe("Name"),

  // Import data related
  type: z.enum(["swagger"]).describe("Import method - only supports swagger"),
  merge: z
    .enum(["normal", "good", "merge"])
    .describe(
      "Data synchronization method - normal(normal import), good(smart merge), merge(force merge)"
    ),
  json: z
    .string()
    .optional()
    .describe("JSON data (optional) - type is serialized string, do not pass object"),
  url: z
    .string()
    .url()
    .optional()
    .describe("Data URL (optional) - if this parameter exists, data will be obtained through url method first"),
});

export default InterfaceSchema;
