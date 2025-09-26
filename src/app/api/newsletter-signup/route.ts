import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/replitmail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Send welcome email to new subscriber
    await sendEmail({
      to: email,
      subject: "Welcome to the ComplianceDrone Pilot Community!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #475569;">Welcome to ComplianceDrone!</h2>
          
          <p>Thank you for joining our nationwide community of drone pilots!</p>
          
          <p>You'll now receive the latest updates on:</p>
          <ul>
            <li><strong>Solar Panel Inspections</strong> - Advanced thermal imaging techniques</li>
            <li><strong>Electrical Infrastructure Monitoring</strong> - Best practices and safety protocols</li>
            <li><strong>Drone Technology</strong> - Latest equipment and software updates</li>
            <li><strong>Pilot Opportunities</strong> - Exclusive job openings and projects</li>
          </ul>
          
          <p>Ready to start flying with us? <a href="https://compliancedrone.com/pilot-registration" style="color: #475569;">Apply to become a certified pilot</a> and join our professional network from coast to coast.</p>
          
          <p>Stay safe and fly high!</p>
          <p><strong>The ComplianceDrone Team</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b;">
            ComplianceDrone - Professional Thermal Inspection Services<br>
            <a href="https://compliancedrone.com">compliancedrone.com</a>
          </p>
        </div>
      `,
      text: `
Welcome to ComplianceDrone!

Thank you for joining our nationwide community of drone pilots!

You'll now receive the latest updates on:
• Solar Panel Inspections - Advanced thermal imaging techniques
• Electrical Infrastructure Monitoring - Best practices and safety protocols  
• Drone Technology - Latest equipment and software updates
• Pilot Opportunities - Exclusive job openings and projects

Ready to start flying with us? Apply to become a certified pilot at compliancedrone.com/pilot-registration and join our professional network from coast to coast.

Stay safe and fly high!
The ComplianceDrone Team

ComplianceDrone - Professional Thermal Inspection Services
compliancedrone.com
      `
    });

    return NextResponse.json({ 
      message: "Successfully subscribed to newsletter!" 
    });

  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}