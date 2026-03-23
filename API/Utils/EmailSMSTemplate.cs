using Model.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Utils
{
    public static class ApplicationEmailTemplateCode
    {
        public const string SCHEDULED = "SCHEDULED";
        public const string RESCHEDULED = "RESCHEDULED";
        public const string CANCELED = "CANCELED";
        public const string APPLICANT_SAVED = "APPLICANT_SAVED";
        public const string APPLICANT_SUBMITTED = "APPLICANT_SUBMITTED";
        public const string APPLICANT_DEFAULTMAILTEMPLATE = "APPLICANT_DEFAULTMAILTEMPLATE";
        public const string ROLE_BASED = "ROLE_BASED";
        public const string LENDING_BANK = "LENDING_BANK";
        public const string APPLICANT_APPROVED = "APPLICANT_APPROVED";
        public const string SCHEME_APPROVED = "SCHEME_APPROVED";
        public const string AMOUNT_CREDITED = "AMOUNT_CREDITED";
        public const string SCHEME_SAVED = "SCHEME_SAVED";
        public const string SCHEME_SUBMITTED = "SCHEME_SUBMITTED";
        public const string OTP = "OTP";
        public const string CARD_ISSUED = "CARD_ISSUED";
        public const string SCHEME_APPROVED_DM_HQ = "SCHEME_APPROVED_DM_HQ";

    }

    public class EmailSMSTemplate
    {
        public EmailTemplateModel GetEmailTemplate(string status)
        {
            EmailTemplateModel model = new EmailTemplateModel();

            // Call Letter
            if (status == ApplicationEmailTemplateCode.SCHEDULED)
            {
                model.Subject = "Meeting Scheduled : Your Application {APPLICATION_ID} status";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Application {APPLICATION_ID} current status is {STATUS}.<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Name: {NAME}<br/>";
                model.Body += "Subject: {SUBJECT}<br/>";
                model.Body += "Venue: {VENUE}<br/>";
                model.Body += "Meeting scheduled on {DATE} Time {FROM} - {TO}.<br/><br/>";
                model.Body += "Comment: {COMMENT}.<br/><br/>";
                model.Body += "Note: Please bring all original documents for the committee meeting.<br/><br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Please call District Officer for any query.<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
            }
            else if (status == ApplicationEmailTemplateCode.RESCHEDULED)
            {
                model.Subject = "Meeting Re-scheduled : Your Application {APPLICATION_ID} status";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Application {APPLICATION_ID} current status is {STATUS}.<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Name: {NAME}<br/>";
                model.Body += "Subject: {SUBJECT}<br/>";
                model.Body += "Venue: {VENUE}<br/>";
                model.Body += "Meeting Re-scheduled on {DATE} Time {FROM} - {TO}.<br/><br/>";
                model.Body += "Comment: {COMMENT}.<br/><br/>";
                model.Body += "Comment: Comment: Please confirm your availability for the new schedule via email/Telephone.<br/><br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Please call or email EXWEL District Office for any query.<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
            }
            else if (status == ApplicationEmailTemplateCode.CANCELED)
            {
                model.Subject = "Meeting Canceled : Your Application {APPLICATION_ID} status";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Application {APPLICATION_ID} current status is {STATUS}.<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Scheduled meeting on {DATE} at {FROM} - {TO} status cancelled.<br/><br/>";
                model.Body += "Comment: Unfortunately, the meeting has been canceled. Please contact the District Office for further information. <br/><br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Please call or email EXWEL District Manager for any questions you have regarding the scheme application. <br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
            }


            // Applicant
            else if (status == ApplicationEmailTemplateCode.APPLICANT_SAVED)
            {
                model.Subject = "Your Application is not submitted";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Your application {APPLICATION_ID} current status is saved.<br/>";
                model.Body += "Your application has not been processed yet.<br/>";
                model.Body += "Please complete the rest of the application and SUBMIT in order to begin the processing.<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Note: This saved (draft) application will be removed from the list after 7 days from the last updated date.<br/>";
                model.Body += "Once removed, you are to submit a fresh application for consideration.<br/><br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Please call or email One Portal District Office for any query you have regarding the scheme.<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "You receive this email because a scheme application has been submitted by you or your behalf<br/>";
            }
            // Applicant
            else if (status == ApplicationEmailTemplateCode.APPLICANT_SUBMITTED)
            {
                model.Subject = "Your Application {APPLICATION_ID} submitted";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Your application {APPLICATION_ID} current status is Submitted.<br/>";
                model.Body += "Your application will be processed.<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Please call or email One Portal District Office for any query you have regarding the scheme.<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "You receive this email because a loan scheme application has been submitted by you or your behalf<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.APPLICANT_DEFAULTMAILTEMPLATE)
            {
                model.Subject = "Your Application {APPLICATION_ID} status";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Application {APPLICATION_ID} current status is {STATUS}.<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Please call or email One Portal District Officer for any query you have regarding the scheme.<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "You receive this email because have applied for Mudhalvarin Kakkum Karangal Scheme.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.ROLE_BASED)
            {
                model.Subject = "Your Application {APPLICATION_ID} status";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Your application {APPLICATION_ID} current status is {STATUS}.<br/>";
                model.Body += "Action on above application is pending for approval, if it's relevant. Otherwise, it's informational only.<br/>";
                model.Body += "EXWEL Scheme Application: {APPLICATION_URL}<br/><br/>";
                model.Body += "Don't reply to this email.\n";
            }
            else if (status == ApplicationEmailTemplateCode.LENDING_BANK)
            {
                model.Subject = "Your Application {APPLICATION_ID} status";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Application {APPLICATION_ID} current status is {STATUS}.<br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Do the approval action on the application, if its relevant. Otherwise its informational only.<br/>";
                model.Body += "EXWEL Scheme Application Link: {APPLICATION_URL}<br/><br/>";
                model.Body += "Please call or email EXWEL District Office for any query you have regarding the scheme.<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";

                model.Body += "You receive this email because you have applied Mudhalvarin Kakkum Karangal Scheme.<br/>";
            }

            else if (status == ApplicationEmailTemplateCode.APPLICANT_APPROVED)
            {
                model.Subject = "Your Application {APPLICATION_ID} status";

                model.Body += "Dear {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}<br/><br/>";
                model.Body += "Hi {RECIPIENTFIRSTNAME}, {RECIPIENTLASTNAME}, your membership {APPLICATION_ID} has been approved.<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Don't reply to this email.<br/><br/>";
                model.Body += "Please call or email ONEPORTAL District Officer for any query you have regarding the scheme.<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "You receive this email because have applied for One Portal Application Scheme.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.SCHEME_APPROVED)
            {
                model.Subject = "Your Scheme Application Approved";

                model.Body += "Dear {RECIPIENTFIRSTNAME} {RECIPIENTLASTNAME},<br/><br/>";
                model.Body += "Congratulations! Your scheme application has been <b>APPROVED</b>.<br/><br/>";
                model.Body += "Scheme Name: {SCHEME_NAME}<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Please contact your District Office for further assistance:<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "Do not reply to this email.<br/>";
                model.Body += "You receive this email because you applied for a scheme on One Portal.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.SCHEME_APPROVED_DM_HQ)
            {
                model.Subject = "Your Application -{SCHEME_NAME}";

                model.Body += "Dear {RECIPIENTNAME} <br/><br/>";
                
                model.Body += "Scheme Name: {SCHEME_NAME}<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Please contact your District Office for further assistance:<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "Do not reply to this email.<br/>";
                model.Body += "You receive this email because you applied for a scheme on One Portal.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.SCHEME_SAVED)
            {
                model.Subject = "Your Application - Scheme saved";

                model.Body += "Dear {RECIPIENTFIRSTNAME} {RECIPIENTLASTNAME},<br/><br/>";
               
                model.Body += "Scheme Name: {SCHEME_NAME}<br/>";
                model.Body += "Your application has not been processed yet.<br/>";
                model.Body += "Please complete the rest of the application and SUBMIT in order to begin the processing.<br/>";
                model.Body += "You've have applied for the {SCHEME_NAME} scheme. <br/>";


                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Please contact your District Office for further assistance:<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "Do not reply to this email.<br/>";
                model.Body += "You receive this email because you applied for a scheme on One Portal.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.SCHEME_SUBMITTED)
            {
                model.Subject = "Your Application  - Scheme Submitted";

                model.Body += "Dear {RECIPIENTFIRSTNAME} {RECIPIENTLASTNAME},<br/><br/>";

                model.Body += "Scheme Name: {SCHEME_NAME}<br/>";
                
                model.Body += "You've have applied for the {SCHEME_NAME} scheme. <br/>";


                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "Please contact your District Office for further assistance:<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "Do not reply to this email.<br/>";
                model.Body += "You receive this email because you applied for a scheme on One Portal.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.OTP)
            {
                model.Subject = "One Portal - OTP";

                model.Body += "Dear {RECIPIENTFIRSTNAME},<br/><br/>";
                model.Body += "Use OTP {OTP} for login. -TAHDCO,<br/><br/>";
               
                
                model.Body += "Please contact your District Office for further assistance:<br/>";
               
                model.Body += "Do not reply to this email.<br/>";
                model.Body += "You receive this email because you applied for a scheme on One Portal.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.AMOUNT_CREDITED)
            {
                model.Subject = "Your Scheme Benefit - Amount Credited for {APPLICATION_ID}";

                model.Body += "Dear {RECIPIENTFIRSTNAME} {RECIPIENTLASTNAME},<br/><br/>";
                model.Body += "We are pleased to inform you that the benefit amount has been credited to your registered account.<br/><br/>";
                model.Body += "Scheme Name: {SCHEME_NAME}<br/>";
                model.Body += "Amount Credited: ₹{AMOUNT}<br/>";
                model.Body += "Application Access: {APPLICATION_URL}<br/><br/>";
                model.Body += "For any queries, please contact your District Office:<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "Do not reply to this email.<br/>";
                model.Body += "You receive this email because you applied for a scheme on One Portal.<br/>";
            }
            else if (status == ApplicationEmailTemplateCode.CARD_ISSUED)
            {
                model.Subject = "Your Application {MEMBER_ID} - Card Issued";

                model.Body += "Dear {RECIPIENTFIRSTNAME} {RECIPIENTLASTNAME},<br/><br/>";
                model.Body += "Your ID card is ready. Download here: {APPLICATION_URL}.<br/><br/>";
               
             
                model.Body += "Please contact your District Office for further assistance:<br/>";
                model.Body += "District Office Name: {MANAGER_NAME}<br/>";
                model.Body += "District Office Email: {MANAGER_EMAIL}<br/>";
                model.Body += "District Office Contact Number: {MANAGER_CONTACT}<br/><br/>";
                model.Body += "Do not reply to this email.<br/>";
                model.Body += "You receive this email because you applied for a scheme on One Portal.<br/>";
            }
            return model;
        }
    }
}
