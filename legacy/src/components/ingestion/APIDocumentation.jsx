import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Key, Link as LinkIcon, CheckCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function APIDocumentation({ apiKey }) {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  
  const baseUrl = window.location.origin;
  
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: "get-sync-jobs",
      method: "GET",
      path: "/api/entities/SyncJob",
      description: "Fetch all active sync jobs",
      auth: "Required",
      example: `curl -X GET "${baseUrl}/api/entities/SyncJob" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
      pythonExample: `import requests

response = requests.get(
    "${baseUrl}/api/entities/SyncJob",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
)

sync_jobs = response.json()
active_jobs = [job for job in sync_jobs if job.get('is_active')]`,
      response: `{
  "data": [
    {
      "id": "job_123",
      "job_name": "OHRT Weekly Sync",
      "source_url": "https://...",
      "tribunal_name": "Ontario Human Rights Tribunal",
      "status": "pending",
      "is_active": true,
      "scraper_config": {...},
      "max_items_per_run": 50
    }
  ]
}`
    },
    {
      id: "get-single-job",
      method: "GET",
      path: "/api/entities/SyncJob/:id",
      description: "Get a specific sync job by ID",
      auth: "Required",
      example: `curl -X GET "${baseUrl}/api/entities/SyncJob/job_123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      pythonExample: `job = requests.get(
    f"${baseUrl}/api/entities/SyncJob/{job_id}",
    headers={"Authorization": f"Bearer {api_key}"}
).json()`,
      response: `{
  "id": "job_123",
  "job_name": "OHRT Weekly Sync",
  "status": "pending",
  "execution_log": [...],
  ...
}`
    },
    {
      id: "update-job",
      method: "PATCH",
      path: "/api/entities/SyncJob/:id",
      description: "Update sync job status and logs",
      auth: "Required",
      example: `curl -X PATCH "${baseUrl}/api/entities/SyncJob/job_123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "running",
    "last_run_date": "2024-01-15T10:00:00Z"
  }'`,
      pythonExample: `requests.patch(
    f"${baseUrl}/api/entities/SyncJob/{job_id}",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={
        "status": "completed",
        "total_cases_ingested": 25,
        "last_run_date": datetime.now().isoformat()
    }
)`,
      response: `{
  "success": true,
  "id": "job_123",
  "updated_fields": ["status", "last_run_date"]
}`
    },
    {
      id: "create-cases",
      method: "POST",
      path: "/api/entities/TribunalCase/bulk",
      description: "Submit scraped tribunal cases",
      auth: "Required",
      example: `curl -X POST "${baseUrl}/api/entities/TribunalCase/bulk" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '[{
    "case_number": "2024 CHRT 1",
    "title": "Smith v. ABC Corp",
    "tribunal": "Canadian Human Rights Tribunal",
    "year": 2024,
    "decision_date": "2024-01-15",
    "outcome": "Upheld - Full"
  }]'`,
      pythonExample: `cases_data = [
    {
        "case_number": case["case_number"],
        "title": case["title"],
        "tribunal": case["tribunal"],
        "year": case["year"],
        "decision_date": case["date"],
        "summary_en": case["text"][:500],
        "full_text_url": case["url"],
        "outcome": "Unknown",
        "protected_ground": ["race"],
        "keywords": case.get("keywords", [])
    }
    for case in scraped_cases
]

response = requests.post(
    f"${baseUrl}/api/entities/TribunalCase/bulk",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json=cases_data
)`,
      response: `{
  "success": true,
  "created_count": 25,
  "ids": ["case_1", "case_2", ...]
}`
    },
    {
      id: "create-feedback",
      method: "POST",
      path: "/api/entities/ClassificationFeedback",
      description: "Submit classification feedback",
      auth: "Required",
      example: `curl -X POST "${baseUrl}/api/entities/ClassificationFeedback" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "case_number": "2024 CHRT 1",
    "case_title": "Smith v. ABC Corp",
    "original_ai_classification": {...},
    "manual_classification": {...},
    "admin_reason": "Corrected classification",
    "feedback_type": "false_positive"
  }'`,
      pythonExample: `feedback = {
    "case_number": case_id,
    "case_title": case_title,
    "case_text_excerpt": text[:1000],
    "original_ai_classification": original,
    "manual_classification": corrected,
    "admin_reason": reason,
    "feedback_type": feedback_type,
    "reviewer_email": admin_email,
    "reviewed_date": datetime.now().isoformat()
}

requests.post(
    f"${baseUrl}/api/entities/ClassificationFeedback",
    headers={"Authorization": f"Bearer {api_key}"},
    json=feedback
)`,
      response: `{
  "success": true,
  "id": "feedback_123"
}`
    }
  ];

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          External API Documentation
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          RESTful API endpoints for external scraper services and automation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication */}
        <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">Authentication</h4>
              <p className="text-sm text-yellow-800 mb-3">
                All API requests require authentication using a Bearer token in the Authorization header.
              </p>
              <div className="bg-yellow-900 text-yellow-100 p-3 rounded font-mono text-xs">
                Authorization: Bearer YOUR_API_KEY
              </div>
              {apiKey && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="bg-yellow-600 text-white">Your API Key:</Badge>
                  <code className="bg-yellow-900 text-yellow-100 px-2 py-1 rounded text-xs">
                    {apiKey.substring(0, 20)}...
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey, 'api-key')}
                  >
                    {copiedEndpoint === 'api-key' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ Keep your API key secret. Generate a new one from your profile settings if compromised.
              </p>
            </div>
          </div>
        </div>

        {/* Base URL */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Base URL
              </h4>
              <code className="text-sm text-purple-800 mt-1 block">
                {baseUrl}
              </code>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(baseUrl, 'base-url')}
            >
              {copiedEndpoint === 'base-url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">API Endpoints</h3>
          
          {endpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={
                          endpoint.method === "GET" ? "bg-blue-100 text-blue-800" :
                          endpoint.method === "POST" ? "bg-green-100 text-green-800" :
                          endpoint.method === "PATCH" ? "bg-orange-100 text-orange-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono text-gray-700">
                          {endpoint.path}
                        </code>
                        {endpoint.auth === "Required" && (
                          <Badge variant="outline" className="border-red-300 text-red-700">
                            <Key className="w-3 h-3 mr-1" />
                            Auth Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{endpoint.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                    </TabsList>

                    <TabsContent value="curl" className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                          {endpoint.example}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard(endpoint.example, `${endpoint.id}-curl`)}
                        >
                          {copiedEndpoint === `${endpoint.id}-curl` ? 
                            <CheckCircle className="w-4 h-4" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="python" className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                          {endpoint.pythonExample}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard(endpoint.pythonExample, `${endpoint.id}-python`)}
                        >
                          {copiedEndpoint === `${endpoint.id}-python` ? 
                            <CheckCircle className="w-4 h-4" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="response" className="mt-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                        {endpoint.response}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Rate Limits */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">⚠️ Rate Limits</h4>
          <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
            <li><strong>Standard tier:</strong> 1,000 requests per hour</li>
            <li><strong>Enterprise tier:</strong> 10,000 requests per hour</li>
            <li><strong>Bulk operations:</strong> Maximum 500 records per request</li>
            <li>Rate limit headers included in responses: <code>X-RateLimit-Remaining</code></li>
          </ul>
        </div>

        {/* Best Practices */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-3">✅ Best Practices</h4>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Use bulk endpoints</strong> when inserting multiple records (TribunalCase/bulk)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Implement retry logic</strong> with exponential backoff for failed requests</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Update job status</strong> before starting scraping (status: "running")</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Log execution details</strong> in the execution_log array for debugging</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Handle CAPTCHA detection</strong> by updating status to "captcha_blocked"</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span><strong>Respect rate limits</strong> and implement delays between requests</span>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Error Responses</h4>
          <div className="space-y-3">
            <div>
              <Badge className="bg-red-100 text-red-800 mb-2">401 Unauthorized</Badge>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs">
{`{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}`}
              </pre>
            </div>
            <div>
              <Badge className="bg-orange-100 text-orange-800 mb-2">400 Bad Request</Badge>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs">
{`{
  "error": "Validation Error",
  "message": "Missing required field: case_number",
  "details": {...}
}`}
              </pre>
            </div>
            <div>
              <Badge className="bg-yellow-100 text-yellow-800 mb-2">429 Too Many Requests</Badge>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs">
{`{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests",
  "retry_after": 3600
}`}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}