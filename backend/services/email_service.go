package services

import (
	"backend/config"
	"backend/rabbitmq"
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
)

type EmailService struct {
	config *config.EmailConfig
	rmq    *rabbitmq.RabbitMQ
}

func NewEmailService(rmq *rabbitmq.RabbitMQ) *EmailService {
	return &EmailService{
		config: config.GetEmailConfig(),
		rmq:    rmq,
	}
}

func (s *EmailService) SendEmail(to, subject, htmlBody string) error {
	auth := smtp.PlainAuth("", s.config.SMTPUser, s.config.SMTPPassword, s.config.SMTPHost)

	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", s.config.FromName, s.config.FromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	addr := fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort)
	return smtp.SendMail(addr, auth, s.config.FromEmail, []string{to}, []byte(message))
}
func (s *EmailService) QueueEmail(to, subject, htmlBody string) error {
	message := map[string]interface{}{
		"type":     "generic",
		"to":       to,
		"subject":  subject,
		"htmlBody": htmlBody,
	}

	return s.rmq.PublishEmail(message)
}
func (s *EmailService) SendWelcomeEmail(to, username string) error {
	subject := "Welcome to Our Platform!"
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Our Platform!</h1>
        </div>
        <div class="content">
            <h2>Hello {{.Username}}!</h2>
            <p>Thank you for signing up. We're excited to have you on board!</p>
            <p>You can now access all the features of our platform.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
	data := struct {
		Username string
	}{
		Username: username,
	}

	var body bytes.Buffer
	t := template.Must(template.New("welcome").Parse(tmpl))
	if err := t.Execute(&body, data); err != nil {
		return err
	}

	return s.QueueEmail(to, subject, body.String())
}

func (s *EmailService) SendLoginNotification(to, username, ipAddress, userAgent string) error {
	subject := "New Login Detected"
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        .warning { background: #fff3cd; border-left-color: #ffc107; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 New Login Detected</h1>
        </div>
        <div class="content">
            <h2>Hello {{.Username}}!</h2>
            <p>We detected a new login to your account.</p>
            <div class="info-box">
                <strong>Login Details:</strong><br>
                IP Address: {{.IPAddress}}<br>
                Device: {{.UserAgent}}<br>
                Time: Just now
            </div>
            <div class="warning">
                <strong>⚠️ Didn't log in?</strong><br>
                If this wasn't you, please reset your password immediately and contact our support team.
            </div>
            <p>Best regards,<br>Security Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
	data := struct {
		Username  string
		IPAddress string
		UserAgent string
	}{
		Username:  username,
		IPAddress: ipAddress,
		UserAgent: userAgent,
	}

	var body bytes.Buffer
	t := template.Must(template.New("login").Parse(tmpl))
	if err := t.Execute(&body, data); err != nil {
		return err
	}

	return s.QueueEmail(to, subject, body.String())
}

func (s *EmailService) SendPasswordResetOTP(to, username, otp string) error {
	subject := "Password Reset OTP"
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; padding: 20px; margin: 20px 0; text-align: center; border: 2px dashed #ff6b6b; border-radius: 10px; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ff6b6b; }
        .warning { background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello {{.Username}}!</h2>
            <p>You requested to reset your password. Use the OTP code below to proceed:</p>
            <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code</p>
                <div class="otp-code">{{.OTP}}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
            </div>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • Never share this OTP with anyone<br>
                • This OTP expires in 10 minutes<br>
                • If you didn't request this, please ignore this email
            </div>
            <p>Best regards,<br>Security Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
	data := struct {
		Username string
		OTP      string
	}{
		Username: username,
		OTP:      otp,
	}

	var body bytes.Buffer
	t := template.Must(template.New("otp").Parse(tmpl))
	if err := t.Execute(&body, data); err != nil {
		return err
	}

	return s.QueueEmail(to, subject, body.String())
}

func (s *EmailService) SendEmailVerification(to, username, verificationLink string) error {
	subject := "Verify Your Email Address"
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .link-box { background: #e9ecef; padding: 15px; margin: 20px 0; border-radius: 5px; word-break: break-all; font-size: 12px; color: #666; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✉️ Verify Your Email</h1>
        </div>
        <div class="content">
            <h2>Hello {{.Username}}!</h2>
            <p>Thank you for signing up! Please verify your email address to activate your account.</p>
            <p>Click the button below to verify your email:</p>
            <div style="text-align: center;">
                <a href="{{.VerificationLink}}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <div class="link-box">{{.VerificationLink}}</div>
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
	data := struct {
		Username         string
		VerificationLink string
	}{
		Username:         username,
		VerificationLink: verificationLink,
	}

	var body bytes.Buffer
	t := template.Must(template.New("verify").Parse(tmpl))
	if err := t.Execute(&body, data); err != nil {
		return err
	}

	return s.QueueEmail(to, subject, body.String())
}

func (s *EmailService) SendWorkspaceInvitation(to, inviterName, workspaceName, invitationLink string) error {
	subject := fmt.Sprintf("Invitation to Join %s's Workspace", inviterName)
	tmpl, err := template.ParseFiles("templates/workspace_member_invite_email.html")

	if err != nil {
		return err
	}

	data := struct {
		WorkspaceName string
		InviterName   string
		InviteURL     string
		ExpiryHours   string
	}{
		WorkspaceName: workspaceName,
		InviterName:   inviterName,
		InviteURL:     invitationLink,
		ExpiryHours:   "24",
	}
	var body bytes.Buffer

	if err := tmpl.Execute(&body, data); err != nil {

		return err
	}
	return s.QueueEmail(to, subject, body.String())

}
