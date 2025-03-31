import os
from openai import OpenAI


def generate_phishing_email(subject, employee_name):
    client = OpenAI(api_key=os.getenv("OPEN_AI_API_KEY"))

    # Dynamic and more flexible prompt including messenger and phishing link
    prompt = f"""
    Generate a phishing email with the subject '{subject}'. 
    - Address the recipient by their name: {employee_name}.
    - Make it look urgent and professional. 
    - Use varied opening lines and realistic email formatting.
    - Use different tones (polite, urgent, threatening, or informative).
    - Ensure the email sounds professional, urgent, or informative based on the subject.
    - The email should feel legitimate, as if coming from a trusted source (e.g., bank, IT support, HR department).
    - Avoid repeating common phrases.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system",
             "content": "You are an expert at crafting realistic phishing emails for cybersecurity awareness training. The email should sound legitimate and align with the provided theme, such as a bank alert, CIO notice, or security department message."},
            {"role": "user", "content": prompt}
        ]
    )

    # Ensure only the email body is returned, without headers
    email_body = response.choices[0].message.content.strip()

    return email_body