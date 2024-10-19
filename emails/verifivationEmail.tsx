// emails/verificationEmail.ts

export const generateVerificationEmail = (username: string, otp: string, host: string, protocol: string): string => {
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body { font-family: 'Roboto', Verdana, sans-serif; }
          .button {
            background-color: #008000;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <h2>Hello ${username},</h2>
        <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
        <p><strong>${otp}</strong></p>
        <p>If you did not request this code, please ignore this email.</p>
        <a href="${protocol}://${host}/verify/${username}" class="button">Verify here</a>
      </body>
    </html>
  `;
};
