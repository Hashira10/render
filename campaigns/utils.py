import os
from openai import OpenAI
import google.generativeai as genai

def generate_phishing_email_open_ai(subject, employee_name):
    client = OpenAI(api_key=os.getenv("OPEN_AI_API_KEY"))
    prompt = f"""
    Generate several phishing emails in HTML format with the subject '{subject}' in russian.
    - Start the whole message with <!DOCTYPE html> and just separate them with "-----" 
    - Make it look urgent and professional. 
    - Use varied opening lines and realistic email formatting.
    - Use different tones (polite, urgent, threatening, or informative).
    - Ensure the email sounds professional, urgent, or informative based on the subject.
    - The email must **only** contain the placeholder [Suspicious Link].
    - Do not include placeholders like [Bank Name], [Company Name], [Unique Code], [Phone Number], [Email Address], or any other entity names.
    - The email should feel legitimate, as if coming from a trusted source (e.g., bank, IT support, HR department).
    - Do not include a signature with any entity name, phone number, or email.
    - The closing of the email should be generic, like Best regards, appropriate department name without any organization name.
    - Avoid repeating common phrases.
    - Each email must include CSS styles.
    - Make sure the styling is simple and professional (e.g., font-family, colors, spacing).
    - Make the emails highly **triggering and emotionally compelling**:
        - Induce a sense of urgency, fear, pressure, or alarm.
        - Simulate a professional tone from trusted sources (e.g., IT department, HR, security team).
        - Mention account suspension, unusual activity, or urgent policy updates.
    - Use HTML <a href="[Suspicious Link]">link text</a> to embed the link under meaningful anchor text.
    - Remove the word "company" from messages as it could be a university or other organization.
    - Write in general, do not mention suspicious activity of a particular account.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system",
             "content": "You are an expert at crafting realistic phishing emails for cybersecurity awareness training. The email should sound legitimate and align with the provided theme, such as a bank alert, CIO notice, or security department message."},
            {"role": "user", "content": prompt}
        ]
    )
    email_body = response.choices[0].message.content.strip()
    return email_body

def generate_phishing_email_gemini(subject, employee_name):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    prompt = f"""
    Generate several formal HTML emails intended for cybersecurity awareness training, with the subject '{subject}'.
    - Start each email with <!DOCTYPE html> and separate them using "-----".
    - The emails should demonstrate common tactics used in suspicious or deceptive messages.
    - Use varied tones: polite, urgent, slightly alarming, or overly helpful.
    - Do not include real brand names, phone numbers, or email addresses.
    - The email must **only** contain the placeholder [Suspicious Link].
    - Do not include placeholders like [Bank Name], [Company Name], [Unique Code], [Phone Number], [Email Address], or any other entity names.
    - Make the messages look authentic but slightly questionable upon closer inspection.
    - Avoid adding organization names or real contact details in the signature.
    - Close the emails with generic endings such as "Regards" or "Support Team".
    - Each email must include CSS styles.
    - Make sure the styling is simple and professional (e.g., font-family, colors, spacing).
    - Make the emails highly **triggering and emotionally compelling**:
        - Induce a sense of urgency, fear, pressure, or alarm.
        - Simulate a professional tone from trusted sources (e.g., IT department, HR, security team).
        - Mention account suspension, unusual activity, or urgent policy updates.
    - Use HTML <a href="[Suspicious Link]">link text</a> to embed the link under meaningful anchor text.
    - Remove the word "company" from messages as it could be a university or other organization.
    - Write in general, do not mention suspicious activity of a particular account.
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text.strip()