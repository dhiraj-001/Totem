import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_52wf8so', // Your EmailJS service ID
  templateId: 'template_l889yux', // Your EmailJS template ID
  publicKey: '4uNPbbh4mrwY7kIYa' // Your EmailJS public key
};

// Interface for task data
interface TaskData {
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  projectName?: string;
}

// Interface for subtask data
interface SubtaskData {
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  parentTaskTitle: string;
}

// Interface for team member data
interface TeamMember {
  id: string;
  name: string;
  personalMail?: string;
  officialMail?: string;
}

// Send task assignment email
export const sendTaskAssignmentEmail = async (
  assignee: TeamMember,
  taskData: TaskData
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    console.log('🔍 Starting email send process...');
    console.log('📧 Assignee data:', assignee);
    console.log('📋 Task data:', taskData);

    // Determine which email to use (prefer personal mail, fallback to official mail)
    const assigneeEmail = assignee.personalMail || assignee.officialMail;

    console.log('📮 Target email address:', assigneeEmail);

    if (!assigneeEmail) {
      console.error('❌ No email address found for assignee');
      return { success: false, error: 'No email address found for assignee' };
    }

    // Format the due date
    const dueDate = new Date(taskData.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    console.log('📅 Formatted due date:', dueDate);

    // Prepare email template parameters - EXACTLY matching your working Hero.tsx template
    const templateParams = {
      name: assignee.name || 'Team Member',
      email: assigneeEmail,
      service: 'Task Management System',
      message: `Hello ${assignee.name || 'Team Member'},

You have been assigned a new task. Please review the details below:

Task Title: ${taskData.title}
${taskData.description ? `Description: ${taskData.description}` : ''}
Due Date: ${dueDate}
Status: ${taskData.status}
${taskData.projectName ? `Project: ${taskData.projectName}` : ''}

Please log into your dashboard to view and update the task status.

This is an automated notification from your task management system.
If you have any questions, please contact your project manager.`
    };

    console.log('📝 Email template parameters:', templateParams);
    console.log('⚙️ EmailJS config:', EMAILJS_CONFIG);

    // Send email using EmailJS
    console.log('🚀 Attempting to send email...');
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Task assignment email sent successfully:', result.text);
    return { success: true, message: 'Email sent successfully' };

  } catch (error) {
    console.error('❌ Error sending task assignment email:', error);
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Send subtask assignment email
export const sendSubtaskAssignmentEmail = async (
  assignee: TeamMember,
  subtaskData: SubtaskData
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    console.log('🔍 Starting subtask email send process...');
    console.log('📧 Assignee data:', assignee);
    console.log('📋 Subtask data:', subtaskData);

    // Determine which email to use (prefer personal mail, fallback to official mail)
    const assigneeEmail = assignee.personalMail || assignee.officialMail;

    console.log('📮 Target email address:', assigneeEmail);

    if (!assigneeEmail) {
      console.error('❌ No email address found for assignee');
      return { success: false, error: 'No email address found for assignee' };
    }

    // Format the due date
    const dueDate = new Date(subtaskData.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    console.log('📅 Formatted due date:', dueDate);

    // Prepare email template parameters - EXACTLY matching your working Hero.tsx template
    const templateParams = {
      name: assignee.name || 'Team Member',
      email: assigneeEmail,
      service: 'Task Management System',
      message: `Hello ${assignee.name || 'Team Member'},

You have been assigned a new subtask. Please review the details below:

Parent Task: ${subtaskData.parentTaskTitle}
Subtask Title: ${subtaskData.title}
${subtaskData.description ? `Description: ${subtaskData.description}` : ''}
Due Date: ${dueDate}
Status: ${subtaskData.status}

Please log into your dashboard to view and update the subtask status.

This is an automated notification from your task management system.
If you have any questions, please contact your project manager.`
    };

    console.log('📝 Email template parameters:', templateParams);
    console.log('⚙️ EmailJS config:', EMAILJS_CONFIG);

    // Send email using EmailJS
    console.log('🚀 Attempting to send subtask email...');
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Subtask assignment email sent successfully:', result.text);
    return { success: true, message: 'Email sent successfully' };

  } catch (error) {
    console.error('❌ Error sending subtask assignment email:', error);
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Test function to verify EmailJS configuration
export const testEmailJS = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    console.log('🧪 Testing EmailJS configuration...');

    // Use EXACTLY the same structure as your working Hero.tsx
    const testParams = {
      name: 'Test User',
      email: 'gogoidhiraj207@gmail.com',
      service: 'Task Management System',
      message: 'This is a test email to verify EmailJS configuration is working correctly. If you receive this, the email system is working!'
    };

    console.log('📝 Test email parameters:', testParams);
    console.log('⚙️ EmailJS config:', EMAILJS_CONFIG);

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      testParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Test email sent successfully:', result.text);
    return { success: true, message: 'Test email sent successfully' };

  } catch (error) {
    console.error('❌ Test email failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};