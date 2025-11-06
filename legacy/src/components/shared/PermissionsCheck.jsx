import React from "react";
import { Shield, Lock } from "lucide-react";

// Default role permissions configuration
export const DEFAULT_PERMISSIONS = {
  "Super Admin": {
    data_access: {
      view_all_cases: true,
      view_sensitive_data: true,
      export_data: true,
      view_analytics: true
    },
    sync_jobs: {
      view_jobs: true,
      create_jobs: true,
      edit_jobs: true,
      delete_jobs: true,
      run_jobs: true
    },
    training_jobs: {
      view_jobs: true,
      create_jobs: true,
      deploy_models: true,
      view_metrics: true
    },
    classification_feedback: {
      view_feedback: true,
      submit_feedback: true,
      review_feedback: true,
      approve_for_training: true
    },
    api_access: {
      view_documentation: true,
      generate_api_keys: true,
      view_api_logs: true
    },
    organization: {
      manage_users: true,
      manage_settings: true,
      view_team: true,
      invite_members: true
    },
    courses: {
      view_all_progress: true,
      manage_courses: true,
      issue_certificates: true
    }
  },
  "Admin": {
    data_access: {
      view_all_cases: true,
      view_sensitive_data: true,
      export_data: true,
      view_analytics: true
    },
    sync_jobs: {
      view_jobs: true,
      create_jobs: true,
      edit_jobs: true,
      delete_jobs: false,
      run_jobs: true
    },
    training_jobs: {
      view_jobs: true,
      create_jobs: true,
      deploy_models: false,
      view_metrics: true
    },
    classification_feedback: {
      view_feedback: true,
      submit_feedback: true,
      review_feedback: true,
      approve_for_training: true
    },
    api_access: {
      view_documentation: true,
      generate_api_keys: true,
      view_api_logs: true
    },
    organization: {
      manage_users: false,
      manage_settings: true,
      view_team: true,
      invite_members: true
    },
    courses: {
      view_all_progress: true,
      manage_courses: false,
      issue_certificates: true
    }
  },
  "Analyst": {
    data_access: {
      view_all_cases: true,
      view_sensitive_data: false,
      export_data: true,
      view_analytics: true
    },
    sync_jobs: {
      view_jobs: true,
      create_jobs: false,
      edit_jobs: false,
      delete_jobs: false,
      run_jobs: false
    },
    training_jobs: {
      view_jobs: true,
      create_jobs: false,
      deploy_models: false,
      view_metrics: true
    },
    classification_feedback: {
      view_feedback: true,
      submit_feedback: true,
      review_feedback: false,
      approve_for_training: false
    },
    api_access: {
      view_documentation: true,
      generate_api_keys: false,
      view_api_logs: false
    },
    organization: {
      manage_users: false,
      manage_settings: false,
      view_team: true,
      invite_members: false
    },
    courses: {
      view_all_progress: false,
      manage_courses: false,
      issue_certificates: false
    }
  },
  "Viewer": {
    data_access: {
      view_all_cases: true,
      view_sensitive_data: false,
      export_data: false,
      view_analytics: true
    },
    sync_jobs: {
      view_jobs: true,
      create_jobs: false,
      edit_jobs: false,
      delete_jobs: false,
      run_jobs: false
    },
    training_jobs: {
      view_jobs: true,
      create_jobs: false,
      deploy_models: false,
      view_metrics: false
    },
    classification_feedback: {
      view_feedback: true,
      submit_feedback: false,
      review_feedback: false,
      approve_for_training: false
    },
    api_access: {
      view_documentation: false,
      generate_api_keys: false,
      view_api_logs: false
    },
    organization: {
      manage_users: false,
      manage_settings: false,
      view_team: true,
      invite_members: false
    },
    courses: {
      view_all_progress: false,
      manage_courses: false,
      issue_certificates: false
    }
  }
};

// Helper function to check if user has permission
export const hasPermission = (user, category, action) => {
  if (!user || !user.role) return false;
  
  // Legacy admin role support
  if (user.role === 'admin') {
    return DEFAULT_PERMISSIONS['Admin']?.[category]?.[action] || false;
  }
  
  // Check custom role permissions
  const userRole = user.role_name || user.role;
  return DEFAULT_PERMISSIONS[userRole]?.[category]?.[action] || false;
};

// Component for permission-based rendering
export function PermissionGate({ user, category, action, children, fallback = null }) {
  if (hasPermission(user, category, action)) {
    return <>{children}</>;
  }
  return fallback;
}

// Component to show access denied message
export function AccessDenied({ message = "You don't have permission to access this feature" }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <Shield className="w-5 h-5 inline mr-2" />
          Contact your administrator if you need access to this feature.
        </div>
      </div>
    </div>
  );
}

export default PermissionGate;