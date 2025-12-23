import { z } from "zod"

const emailSchema = z.object({
  to: z.string().email("البريد الإلكتروني غير صحيح"),
  subject: z.string().min(1, "الموضوع مطلوب"),
  html: z.string().min(1, "المحتوى مطلوب"),
})

export class EmailService {
  private static async sendEmail(data: z.infer<typeof emailSchema>) {
    try {
      // Validate email data
      const validatedData = emailSchema.parse(data)

      // For development, log the email instead of sending
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Email would be sent:", {
          to: validatedData.to,
          subject: validatedData.subject,
          html: validatedData.html,
        })
        return { success: true, message: "Email logged in development mode" }
      }

      // For production, you would integrate with an email service
      // Examples: SendGrid, AWS SES, Resend, etc.
      
      // Example with a hypothetical email API
      const response = await fetch("https://api.emailservice.com/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: validatedData.to,
          subject: validatedData.subject,
          html: validatedData.html,
          from: process.env.FROM_EMAIL || "noreply@saasapp.com",
        }),
      })

      if (!response.ok) {
        throw new Error("Email service failed")
      }

      return { success: true, message: "Email sent successfully" }
    } catch (error) {
      console.error("Email sending error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to send email" }
    }
  }

  static async sendInvitationEmail(
    to: string,
    tenantName: string,
    inviterName: string,
    role: string,
    invitationToken: string
  ) {
    const roleText = {
      OWNER: "مالك",
      ADMIN: "مدير", 
      MEMBER: "عضو",
    }[role] || role

    const subject = `دعوة للانضمام إلى ${tenantName}`
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>دعوة للانضمام إلى ${tenantName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .invitation-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .role-badge { background: #e3f2fd; color: #0969da; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ساسaaS</div>
            <p>منصة متعددة المستأجرين</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">دعوة للانضمام إلى فريق العمل!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              مرحباً،<br><br>
              <strong>${inviterName}</strong> يدعوك للانضمام إلى مؤسسة <strong>${tenantName}</strong> على منصة ساسaaS.
            </p>
            
            <div class="invitation-details">
              <h3 style="margin-top: 0; color: #333;">تفاصيل الدعوة:</h3>
              <ul style="text-align: right; padding-right: 20px;">
                <li><strong>المؤسسة:</strong> ${tenantName}</li>
                <li><strong>الدور:</strong> <span class="role-badge">${roleText}</span></li>
                <li><strong>المدعو:</strong> ${inviterName}</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/invite?token=${invitationToken}" class="btn">
                قبول الدعوة
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              أو انسخ هذا الرابط:<br>
              <code style="background: #f4f4f4; padding: 8px; border-radius: 4px; font-size: 12px;">
                ${process.env.NEXT_PUBLIC_APP_URL}/auth/invite?token=${invitationToken}
              </code>
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>ملاحظة:</strong> هذه الدعوة صالحة لمدة 7 أيام فقط
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>تم إرسال هذه الدعوة من منصة ساسaaS</p>
            <p>إذا لم تكن تتوقع هذه الدعوة، يرجى تجاهلها.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({ to, subject, html })
  }

  static async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName: string
  ) {
    const subject = "إعادة تعيين كلمة المرور"
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إعادة تعيين كلمة المرور</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .btn { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ساسaaS</div>
            <p>منصة متعددة المستأجرين</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              مرحباً ${userName}،<br><br>
              تم استلام طلب إعادة تعيين كلمة المرور لحسابك. اضغط على الزر أدناه لتعيين كلمة مرور جديدة.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}" class="btn">
                تعيين كلمة مرور جديدة
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              أو انسخ هذا الرابط:<br>
              <code style="background: #f4f4f4; padding: 8px; border-radius: 4px; font-size: 12px;">
                ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}
              </code>
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>ملاحظة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p>تم إرسال هذا البريد من منصة ساسaaS</p>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({ to, subject, html })
  }
}