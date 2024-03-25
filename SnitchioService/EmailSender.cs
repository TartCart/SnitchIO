using System;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.IO;
using System.Collections.Generic;
using System.Timers;
using snitchio;
using System.Xml.Linq;
using System.Linq;


/* The email sender takes in and retains the alert according to the timer,
 * once the timer elapses the emails are sent either as singular if one or many if many..
 * this prevents end-user inbox overload in case many alerts are generated at once
 * checks the exclusion list and removes the alert if it contains any of the exclusions */

public class EmailSender
{
    private static List<string> alertMessages = new List<string>();
    private static Timer alertTimer;
    private static readonly object lockObject = new object();
    private static String  singleSubject;
    private static List<string> exclusions = new List<string>();

    public EmailSender()
    {
        // start a timer for 7 minutes
        alertTimer = new Timer(400000);  // TODO: make this variable for user input
        // alertTimer = new Timer(10000); //testing for 10 sec
        alertTimer.Elapsed += OnTimedEvent;
        alertTimer.AutoReset = true;
        alertTimer.Enabled = true;
    }

    // load and create exclusion list
    private static void LoadExclusions()
    {
        string exclusionsPath = "C:\\ProgramData\\snitchIO\\resources\\exclusions.txt";
        if (File.Exists(exclusionsPath))
        {
            string exclusionsContent = File.ReadAllText(exclusionsPath);
            exclusions = exclusionsContent.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                                          .Select(exclusion => exclusion.Trim())
                                          .ToList();
        }
        else
        {
            Program.LogMessage("Exclusions file does not exist.");
        }
    }

    public void QueueAlert(string subject, string body)
    {
        
        lock (lockObject)
        {
            // Add the alert body to the list of messages if it does not contain any exclusions
            if (!ContainsExclusions(body))
            {
                LoadExclusions();
                alertMessages.Add(body);
                singleSubject = subject;
            }
        }
    }

    // Check exclusion 
    private bool ContainsExclusions(string message)
    {
        bool excluded = exclusions.Any(exclusion => message.Contains(exclusion));
        if (excluded)
        {
            Program.LogMessage("Exclusion matched, skipping email generation.");
            return excluded;
        } else {
            return excluded;
        }
    }

    private void OnTimedEvent(Object source, ElapsedEventArgs e)
    {
        List<string> messagesToSend;
        lock (lockObject)
        {
            if (alertMessages.Count == 0)
            {
                return; // No alerts to send
            }
            else if (alertMessages.Count == 1)
            {
                // Send a single email with the single subject and clear the list/subject
                var singleAlert = alertMessages[0];
                SendEmail(singleSubject, singleAlert);
                singleSubject = null;
                alertMessages.Clear();
            }
            else
            {

                // Copy the messages to send and clear the original list
                messagesToSend = new List<string>(alertMessages);
                alertMessages.Clear();
                singleSubject = null;
                // consolidate messages into a single body
                string consolidatedBody = string.Join("\n---------------------------------------------------------\n", messagesToSend);
                SendEmail("Multiple alerts", consolidatedBody);
            }
        }
    }

    private void SendEmail(string subject, string body)
    {
        string filePath = "C:\\ProgramData\\snitchIO\\resources\\alertees.txt";
        FileInfo fileInfo = new FileInfo(filePath);
        if (!fileInfo.Exists || fileInfo.Length == 0) // Check if the file is empty or does not exist
        {
            Program.LogMessage("The recipient email file is empty or never created");
            return; // exit method early if empty since there aren't any addresses to work with
        }
        string allEmails = File.ReadAllText(filePath);
        string[] recipientEmails = allEmails.Split(',');

        try
        {
            // Decode the app pa$ from encoded string
            string baseAppas = File.ReadAllText("C:\\ProgramData\\snitchIO\\resources\\APPAS.txt");
            string appas = Encoding.UTF8.GetString(Convert.FromBase64String(baseAppas));

            // Create and configure the mail message
            using (MailMessage mail = new MailMessage())
            {
                mail.From = new MailAddress("snitchio.alert@gmail.com");
                foreach (var recipientEmail in recipientEmails)
                {
                    mail.To.Add(recipientEmail);
                }
                mail.Subject = subject;
                mail.Body = body;

                // Configure and send the message
                using (SmtpClient smtpServer = new SmtpClient("smtp.gmail.com", 587))
                {
                    smtpServer.EnableSsl = true;
                    smtpServer.Credentials = new NetworkCredential("snitchio.alert@gmail.com", appas);
                    smtpServer.Send(mail);
                }
            }
        }
        catch (Exception ex)
        {
            Program.LogMessage("Error sending email: " + ex.Message);
        }
    }
}
