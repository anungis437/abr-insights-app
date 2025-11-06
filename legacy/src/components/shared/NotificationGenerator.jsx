import { base44 } from "@/api/base44Client";

/**
 * Centralized notification generation system
 * Handles creation and email notifications for various events
 */

export class NotificationGenerator {
  
  /**
   * Send course reminder notification
   */
  static async sendCourseReminder(userEmail, courseName, courseDaysInactive) {
    try {
      // Create in-app notification
      await base44.entities.Notification.create({
        user_email: userEmail,
        type: "course_reminder",
        title: "Continue Your Learning",
        message: `You haven't accessed "${courseName}" in ${courseDaysInactive} days. Keep up the momentum!`,
        link: "/CoursePlayer",
        priority: "medium"
      });

      // Send email
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: "Continue Your Learning Journey",
        body: `
Hi there,

We noticed you haven't accessed your course "${courseName}" in ${courseDaysInactive} days.

Don't lose your momentum! Even 15 minutes of learning can make a big difference.

Click here to continue: [Course Link]

Keep up the great work!

The ABR Insight Team
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send course reminder:', error);
      return false;
    }
  }

  /**
   * Send certificate earned notification
   */
  static async sendCertificateEarned(userEmail, userName, courseTitle, certificateUrl) {
    try {
      await base44.entities.Notification.create({
        user_email: userEmail,
        type: "certificate_earned",
        title: "🎉 Certificate Earned!",
        message: `Congratulations! You've earned a certificate for completing "${courseTitle}"`,
        link: "/Achievements",
        priority: "high"
      });

      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: "🎉 Congratulations! Certificate Earned",
        body: `
Dear ${userName},

Congratulations on completing "${courseTitle}"!

Your dedication to combating anti-Black racism through education is commendable.

Your certificate is now available: [Download Certificate]

Share your achievement:
- Add it to your LinkedIn profile
- Include it in your professional portfolio
- Inspire your colleagues

Next steps:
- Explore advanced courses
- Apply your learning in practice
- Mentor others in their journey

Keep up the excellent work!

Best regards,
The ABR Insight Team

[Download Certificate: ${certificateUrl}]
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send certificate notification:', error);
      return false;
    }
  }

  /**
   * Send team invitation notification
   */
  static async sendTeamInvite(userEmail, organizationName, inviterName, role) {
    try {
      await base44.entities.Notification.create({
        user_email: userEmail,
        type: "team_invite",
        title: "Team Invitation",
        message: `${inviterName} invited you to join ${organizationName} as ${role}`,
        link: "/OrgDashboard",
        priority: "high"
      });

      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `Team Invitation from ${organizationName}`,
        body: `
Hello,

${inviterName} has invited you to join ${organizationName} on ABR Insight.

Role: ${role}

ABR Insight provides evidence-based training and data analysis tools to combat anti-Black racism in Canadian workplaces.

Click here to accept your invitation: [Accept Invitation]

Questions? Contact ${inviterName} or our support team.

Welcome aboard!
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send team invite:', error);
      return false;
    }
  }

  /**
   * Send milestone reached notification
   */
  static async sendMilestoneReached(userEmail, milestoneName, milestoneDescription, points) {
    try {
      await base44.entities.Notification.create({
        user_email: userEmail,
        type: "milestone_reached",
        title: `🏆 Milestone: ${milestoneName}`,
        message: milestoneDescription,
        link: "/Achievements",
        priority: "high"
      });

      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `🏆 Milestone Reached: ${milestoneName}`,
        body: `
Congratulations!

You've reached an important milestone: ${milestoneName}

${milestoneDescription}

Points Earned: +${points}

Your commitment to learning about anti-Black racism and creating inclusive workplaces is making a real difference.

View your achievements: [Achievements Page]

Keep up the amazing work!
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send milestone notification:', error);
      return false;
    }
  }

  /**
   * Send system announcement
   */
  static async sendSystemAnnouncement(userEmail, title, message, priority = "medium") {
    try {
      await base44.entities.Notification.create({
        user_email: userEmail,
        type: "system_announcement",
        title,
        message,
        link: "/Dashboard",
        priority
      });

      return true;
    } catch (error) {
      console.error('Failed to send system announcement:', error);
      return false;
    }
  }

  /**
   * Bulk send notifications to multiple users
   */
  static async bulkSendNotifications(userEmails, notificationData) {
    const results = {
      successful: [],
      failed: []
    };

    for (const email of userEmails) {
      try {
        await base44.entities.Notification.create({
          user_email: email,
          ...notificationData
        });
        results.successful.push(email);
      } catch (error) {
        results.failed.push({ email, error: error.message });
      }
    }

    return results;
  }

  /**
   * Send weekly progress report (for team admins)
   */
  static async sendWeeklyProgressReport(adminEmail, organizationName, reportData) {
    try {
      const {
        totalMembers,
        activeMembers,
        coursesCompleted,
        certificatesEarned,
        averageProgress,
        atRiskLearners
      } = reportData;

      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `📊 Weekly Progress Report - ${organizationName}`,
        body: `
Weekly Progress Report for ${organizationName}

OVERVIEW
---------
Total Members: ${totalMembers}
Active This Week: ${activeMembers}
Courses Completed: ${coursesCompleted}
Certificates Earned: ${certificatesEarned}
Average Progress: ${averageProgress}%

AT-RISK LEARNERS
-----------------
${atRiskLearners.length} members haven't logged in for 14+ days.
Consider reaching out to re-engage them.

RECOMMENDATIONS
---------------
- Celebrate recent achievements in team meeting
- Share top performers on leaderboard
- Schedule group training sessions
- Review and update learning paths

View full report: [Analytics Dashboard]

Questions? Contact support@abrinsight.ca
        `
      });

      return true;
    } catch (error) {
      console.error('Failed to send weekly report:', error);
      return false;
    }
  }

  /**
   * Detect and notify at-risk learners
   */
  static async notifyAtRiskLearners(threshold_days = 14) {
    try {
      // Get all progress records
      const allProgress = await base44.entities.Progress.list();
      const now = new Date();

      const atRiskUsers = allProgress.filter(progress => {
        if (!progress.last_accessed) return false;
        
        const lastAccessed = new Date(progress.last_accessed);
        const daysSince = (now - lastAccessed) / (1000 * 60 * 60 * 24);
        
        return daysSince >= threshold_days && progress.completion_percentage < 100;
      });

      for (const progress of atRiskUsers) {
        // Get course details
        const courses = await base44.entities.Course.list();
        const course = courses.find(c => c.id === progress.course_id);
        
        if (course) {
          await this.sendCourseReminder(
            progress.user_email,
            course.title_en,
            threshold_days
          );
        }
      }

      return {
        totalAtRisk: atRiskUsers.length,
        notificationsSent: atRiskUsers.length
      };
    } catch (error) {
      console.error('Failed to process at-risk learners:', error);
      return { totalAtRisk: 0, notificationsSent: 0 };
    }
  }
}

export default NotificationGenerator;