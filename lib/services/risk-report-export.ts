/**
 * Risk Report Export Service
 * Generates formatted reports for stakeholder distribution
 */

import {
  type DepartmentRiskScore,
  type OrganizationRiskSummary,
  type UserRiskDetail,
} from './risk-analytics'

/**
 * Generate CSV report for department risk scores
 */
export function generateDepartmentRiskCSV(
  summary: OrganizationRiskSummary,
  departments: DepartmentRiskScore[]
): string {
  const headers = [
    'Department',
    'Location',
    'Risk Level',
    'Risk Score',
    'Total Users',
    'Completion Rate',
    'Avg Quiz Score',
    'Days Since Training',
    'Pending Users',
    'At Risk Users',
    'Key Risk Factors',
  ]

  const rows = departments.map((dept) => [
    dept.department,
    dept.location || 'N/A',
    dept.risk_level.toUpperCase(),
    dept.risk_score.toFixed(1),
    dept.total_users.toString(),
    (dept.training_completion_rate * 100).toFixed(1) + '%',
    dept.avg_quiz_score.toFixed(1) + '%',
    dept.days_since_last_training.toString(),
    dept.pending_users.toString(),
    dept.at_risk_users.toString(),
    dept.factors.map((f) => f.category).join('; '),
  ])

  const summarySection = [
    ['ORGANIZATION RISK SUMMARY'],
    ['Overall Risk Level', summary.overall_risk_level.toUpperCase()],
    ['Overall Risk Score', summary.overall_risk_score.toFixed(1)],
    ['Total Departments', summary.total_departments.toString()],
    ['High Risk Departments', summary.high_risk_departments.toString()],
    ['Total Users', summary.total_users.toString()],
    ['Compliant Users', summary.compliant_users.toString()],
    ['At Risk Users', summary.at_risk_users.toString()],
    ['Report Generated', new Date().toLocaleString()],
    [],
    ['DEPARTMENT BREAKDOWN'],
  ]

  const csv = [...summarySection, headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  return csv
}

/**
 * Generate HTML report for PDF conversion or email
 */
export function generateDepartmentRiskHTML(
  summary: OrganizationRiskSummary,
  departments: DepartmentRiskScore[],
  organizationName: string = 'Organization'
): string {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return '#10b981'
      case 'medium':
        return '#f59e0b'
      case 'high':
        return '#f97316'
      case 'critical':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const departmentRows = departments
    .map(
      (dept) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${dept.department}</strong>
        ${dept.location ? `<br/><span style="color: #6b7280; font-size: 12px;">${dept.location}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="
          background: ${getRiskColor(dept.risk_level)};
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        ">${dept.risk_level}</span>
        <div style="margin-top: 4px; color: #6b7280; font-size: 12px;">${dept.risk_score.toFixed(0)}/100</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${dept.total_users}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${(dept.training_completion_rate * 100).toFixed(1)}%
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${dept.avg_quiz_score.toFixed(1)}%
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${dept.days_since_last_training} days
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${dept.at_risk_users}
      </td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Risk Assessment Report - ${organizationName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #1f2937;
      font-size: 32px;
    }
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .summary-card h3 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
    }
    .summary-card .subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    thead {
      background: #f9fafb;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .summary-grid { page-break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Risk Assessment Report</h1>
    <div class="subtitle">${organizationName} | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>

  <div class="summary-grid">
    <div class="summary-card" style="border-left-color: ${getRiskColor(summary.overall_risk_level)};">
      <h3>Overall Risk Level</h3>
      <div class="value" style="color: ${getRiskColor(summary.overall_risk_level)}; text-transform: uppercase; font-size: 24px;">
        ${summary.overall_risk_level}
      </div>
      <div class="subtitle">${summary.overall_risk_score.toFixed(0)}/100 Score</div>
    </div>
    <div class="summary-card" style="border-left-color: #f97316;">
      <h3>High Risk Departments</h3>
      <div class="value">${summary.high_risk_departments}</div>
      <div class="subtitle">of ${summary.total_departments} total</div>
    </div>
    <div class="summary-card" style="border-left-color: #10b981;">
      <h3>Compliant Users</h3>
      <div class="value">${summary.compliant_users}</div>
      <div class="subtitle">${((summary.compliant_users / summary.total_users) * 100).toFixed(1)}% of ${summary.total_users}</div>
    </div>
    <div class="summary-card" style="border-left-color: #dc2626;">
      <h3>At Risk Users</h3>
      <div class="value">${summary.at_risk_users}</div>
      <div class="subtitle">Require intervention</div>
    </div>
  </div>

  <h2 style="margin-bottom: 20px; font-size: 20px;">Department Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Department</th>
        <th style="text-align: center;">Risk Level</th>
        <th style="text-align: center;">Total Users</th>
        <th style="text-align: center;">Completion Rate</th>
        <th style="text-align: center;">Avg Quiz Score</th>
        <th style="text-align: center;">Training Recency</th>
        <th style="text-align: center;">At Risk</th>
      </tr>
    </thead>
    <tbody>
      ${departmentRows}
    </tbody>
  </table>

  <div class="footer">
    <p><strong>ABR Insights</strong> | Evidence-Based HR Compliance Platform</p>
    <p>This report contains confidential compliance data. Distribution should be limited to authorized personnel.</p>
  </div>
</body>
</html>
`
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Trigger browser print dialog for HTML report (converts to PDF)
 */
export function printHTMLReport(htmlContent: string): void {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

/**
 * Generate executive summary for email distribution
 */
export function generateExecutiveSummary(
  summary: OrganizationRiskSummary,
  departments: DepartmentRiskScore[]
): string {
  const highRiskDepts = departments.filter(
    (d) => d.risk_level === 'high' || d.risk_level === 'critical'
  )

  const topIssues = new Map<string, number>()
  departments.forEach((dept) => {
    dept.factors.forEach((factor) => {
      topIssues.set(factor.category, (topIssues.get(factor.category) || 0) + 1)
    })
  })

  const sortedIssues = Array.from(topIssues.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return `
COMPLIANCE RISK ASSESSMENT - EXECUTIVE SUMMARY
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

OVERALL STATUS: ${summary.overall_risk_level.toUpperCase()} RISK (${summary.overall_risk_score.toFixed(0)}/100)

KEY METRICS:
• ${summary.compliant_users} of ${summary.total_users} users are compliant (${((summary.compliant_users / summary.total_users) * 100).toFixed(1)}%)
• ${summary.at_risk_users} users require immediate intervention
• ${summary.high_risk_departments} of ${summary.total_departments} departments are high-risk

${
  highRiskDepts.length > 0
    ? `HIGH-RISK DEPARTMENTS:\n${highRiskDepts.map((d) => `• ${d.department}: ${d.at_risk_users} at-risk users, ${(d.training_completion_rate * 100).toFixed(0)}% completion`).join('\n')}`
    : 'All departments are within acceptable risk thresholds.'
}

TOP RISK FACTORS:
${sortedIssues.map(([issue, count]) => `• ${issue} (${count} departments affected)`).join('\n')}

RECOMMENDED ACTIONS:
${summary.at_risk_users > 0 ? '• Immediate: Enroll at-risk users in required training\n' : ''}${summary.high_risk_departments > 0 ? '• Urgent: Focus remediation efforts on high-risk departments\n' : ''}${departments.some((d) => d.days_since_last_training > 180) ? '• Scheduled: Plan refresher training for departments with aging certifications\n' : ''}${departments.some((d) => d.avg_quiz_score < 75) ? '• Review: Assess training material effectiveness (low quiz scores)\n' : ''}

For detailed department-level analysis, see the attached full report.
`
}
