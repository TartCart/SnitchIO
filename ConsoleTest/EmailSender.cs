using System.Net;
using System.Net.Mail;
using System.Text;

public class EmailSender
{
    // need to make the recipient email into list for multiple emails
    public void SendEmail(string recipientEmail, string subject, string body)
    {
        try
        {
            // get the appas
            string base64EncodedPassword = File.ReadAllText("resources\\APPAS.txt");
            string appPassword = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedPassword));

            // create the mail message
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress("watchtower.main.alert@gmail.com");
            mail.To.Add(recipientEmail);
            mail.Subject = subject;
            mail.Body = body;

            // send the message
            using (SmtpClient smtpServer = new SmtpClient("smtp.gmail.com"))
            {
                smtpServer.Port = 587;
                smtpServer.Credentials = new NetworkCredential("watchtower.main.alert@gmail.com", appPassword);
                smtpServer.EnableSsl = true;

                smtpServer.Send(mail);
            }
        }

        // send this to log file if fails
        catch (Exception ex)
        {
            Console.WriteLine("Error sending email: " + ex.Message);
        }
    }
}
