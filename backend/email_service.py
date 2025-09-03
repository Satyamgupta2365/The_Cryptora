import smtplib
import os
from email.mime.text import MIMEText
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def generate_email_content(self, condition: str, balance: float, threshold: float = None) -> str:
        prompt = f"""
        Generate a professional email notifying the user about a crypto wallet balance update.
        Condition: {condition}
        Current Balance: ${balance:.2f}
        {f'Threshold: ${threshold:.2f}' if threshold else ''}
        The email should be concise, polite, and include a clear call-to-action to check the wallet.
        """
        response = self.groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="lllama-3.1-8b-instant"
        )
        return response.choices[0].message.content

    def send_email(self, to_email: str, subject: str, body: str) -> None:
        if not self.smtp_user or not self.smtp_password:
            raise ValueError("SMTP credentials not configured")

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = self.smtp_user
        msg['To'] = to_email

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            raise Exception(f"Failed to send email: {str(e)}")