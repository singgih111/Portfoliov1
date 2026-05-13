import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend with your API key from the .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Parse the request body to get the form data
    const { name, email, message } = await request.json();

    // Use Resend to send the email
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // This is a required field, 'onboarding@resend.dev' is a good default
      to: ['singgihkosasih123@gmail.com'], // <--- IMPORTANT: REPLACE THIS WITH YOUR ACTUAL EMAIL ADDRESS
      subject: `New Message from ${name} via Portfolio`,
      reply_to: email, // Set the reply-to address to the user's email
      html: `<p>You have a new message from your portfolio contact form.</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    });

    // If there was an error sending the email, return an error response
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If the email was sent successfully, return a success response
    return NextResponse.json({ message: 'Email sent successfully!', data });

  } catch (error) {
    // If there was any other error, return an error response
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}