# ⚙️ Business Logic Engine (n8n Workflow)

This boilerplate includes a **pre-configured n8n workflow** designed to handle complex business logic without writing a single line of backend code.

---

## 🚀 What This Workflow Does

The visual automation engine handles the complete approval workflow:

1. **Triggers** when a new timesheet is submitted via Webhook
2. **Extracts and formats** submission data dynamically
3. **Generates** a secure, unique validation token with 7-day expiration
4. **Stores** the token directly in your Supabase database
5. **Sends** a professional approval email to the client with validation link
6. **Logs** all executions for debugging and analytics

**Value**: This replaces ~400 lines of backend code and saves 8+ hours of development time.

---

## 📦 What's Included
```
n8n/
├── timesheet-approval-workflow.json  # Complete workflow (ready to import)
└── workflow-preview.png              # Visual diagram of the automation
```

**Workflow Components**:
- ✅ Webhook Trigger (catches submissions from your React app)
- ✅ Data Transformation (formats fields for database)
- ✅ Token Generator (JavaScript node with cryptographic randomness)
- ✅ Database Writer (HTTP request to Supabase REST API)
- ✅ Email Sender (Gmail integration with HTML template)

---

## 🛠️ Setup Instructions (10 Minutes)

### Step 1: Install n8n

Choose one of these options:

#### Option A: npm (Local Development)
```bash
npm install -g n8n
n8n start
```

Visit `http://localhost:5678`

#### Option B: Docker (Recommended for Production)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Option C: n8n Cloud (Easiest)
Sign up at [n8n.cloud](https://n8n.cloud) - Free tier available

---

### Step 2: Import the Workflow

1. In n8n, click **Workflows** → **Import from File**
2. Select `n8n/timesheet-approval-workflow.json`
3. The workflow appears on your canvas with 5 connected nodes

**Visual Reference**: See `workflow-preview.png` for the complete flow diagram

---

### Step 3: Configure Supabase Connection

#### A. Update the Database Node

1. Click on the **"Save Token to Database"** node (HTTP Request)
2. Update the **URL**:

**Replace**:
```
https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/rest/v1/validation_tokens
```

**With** (example):
```
https://abcdefgh.supabase.co/rest/v1/validation_tokens
```

Find your project ID: Supabase → Settings → General → Project URL

#### B. Configure Authentication Headers

1. In the same node, scroll to **Headers**
2. Update two headers with your **service_role** key:

**Header 1 - apikey**:
```
Name: apikey
Value: [Paste your service_role key here]
```

**Header 2 - Authorization**:
```
Name: Authorization
Value: Bearer [Paste your service_role key here]
```

**Where to find your service_role key**:
- Supabase → Settings → API
- Scroll to "Project API keys"
- Click **Reveal** next to "service_role secret"
- Copy the long key (starts with `eyJhbGc...`)

⚠️ **Security Note**: The service_role key bypasses Row Level Security. Never expose it in your frontend code. It's safe in n8n because it runs server-side.

---

### Step 4: Configure Email Sender

#### A. Setup Gmail Credentials

1. Click on the **"Send Approval Email"** node
2. Click **"Credential to connect with"** → **"Create New"**
3. Choose **Gmail OAuth2**
4. Follow the OAuth authorization flow
5. Grant n8n permission to send emails

**Alternative - SMTP**: If you prefer SMTP over OAuth, select "SMTP" and enter:
- Host: `smtp.gmail.com`
- Port: `587`
- User: Your email
- Password: [Gmail App Password](https://support.google.com/accounts/answer/185833)

#### B. Customize the Email Template

In the **Message** field, find and replace:

**Company Name** (2 occurrences):
```html
[YOUR COMPANY NAME]
```

**Optional Customizations**:
- **Logo**: Add `<img src="https://your-logo-url.com/logo.png" width="150">`
- **Colors**: Replace `#2563eb` (blue) with your brand color
- **Text**: Modify subject line and email body to match your tone

**Preview the email**: Click **"Execute Node"** to send a test email to yourself

---

### Step 5: Connect to Your React App

#### A. Activate the Workflow

1. Click the **toggle switch** at the top of the workflow (should turn green)
2. Status changes to **"Active"**

#### B. Get the Webhook URL

1. Click on the first node (**"Webhook - Timesheet Submitted"**)
2. Copy the **Production URL** (looks like):
```
https://your-n8n-instance.com/webhook/abc123-xyz789
```

#### C. Update Your .env File

Add the webhook URL to your React app's environment variables:
```env
VITE_N8N_WEBHOOK_SUBMISSION=https://your-n8n-instance.com/webhook/abc123-xyz789
```

#### D. Restart Your React App
```bash
npm run dev
```

**The workflow is now live!** 🎉

---

## 🧪 Testing Your Workflow

### Test Submission

1. Go to your React app (`http://localhost:3000`)
2. Login as an employee
3. Submit a test timesheet
4. Watch the magic happen:
   - ✅ Check n8n **Executions** (green checkmark = success)
   - ✅ Check Supabase **validation_tokens** table (new row appears)
   - ✅ Check your client's email inbox (approval email received)

### Debug Mode

If something goes wrong:

1. In n8n, click **Executions** (left sidebar)
2. Click on the failed execution (red ❌)
3. See exactly which node failed and why
4. Common issues:
   - Wrong Supabase URL → Check project ID
   - 401 error → Wrong service_role key
   - Email not sending → Check Gmail credentials

---

## 🎨 Customization Options

### Change Token Expiration

**Default**: 7 days  
**To customize**:

1. Click **"Generate Validation Token"** node (JavaScript)
2. Find line 20:
```javascript
expiresAt.setDate(expiresAt.getDate() + 7);  // 7 days
```

3. Change `7` to your desired number of days
4. Save the workflow

### Add Slack Notifications

Want to get notified in Slack when timesheets are submitted?

1. Add a **Slack** node after the Email node
2. Connect it to the flow
3. Configure your Slack webhook
4. Test and activate

### Add SMS Notifications (Twilio)

1. Add a **Twilio** node
2. Connect it parallel to the Email node
3. Configure Twilio credentials
4. Send SMS to client for urgent approvals

### Store Execution Logs

Track all workflow executions in your database:

1. Add another **HTTP Request** node at the end
2. POST to Supabase `webhooks_log` table
3. Store: `timestamp`, `status`, `timesheet_id`

---

## 📊 Workflow Architecture
```
┌─────────────────────────────────────────────────────────┐
│  1. TRIGGER                                             │
│  Webhook receives POST from React app                   │
│  Payload: timesheet data (employee, hours, client)      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│  2. EXTRACT                                             │
│  Edit Fields node formats data:                         │
│  • timesheet_id, employee_name, company_email           │
│  • week_start, total_hours, app_url                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│  3. GENERATE                                            │
│  JavaScript node creates:                               │
│  • Unique token (timestamp + random)                    │
│  • Validation URL with token                            │
│  • Expiration date (7 days default)                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│  4. STORE                                               │
│  HTTP Request (POST) to Supabase:                       │
│  • Inserts into validation_tokens table                 │
│  • Links to timesheet_id                                │
│  • Stores client_email for authorization                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│  5. NOTIFY                                              │
│  Gmail sends professional email:                        │
│  • To: client_email                                     │
│  • Subject: Timesheet Approval Required                 │
│  • Body: HTML template with validation link             │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

### Tip 1: Use Test Webhook During Development

- The Webhook node has both **Test URL** and **Production URL**
- Use Test URL for debugging (manual triggers)
- Switch to Production URL once everything works

### Tip 2: Enable Workflow Versioning

n8n saves workflow history automatically:
- View past versions: Click ⋮ menu → **Versions**
- Restore if needed

### Tip 3: Monitor Execution Performance

Check execution times in n8n dashboard:
- Typical execution: 2-3 seconds
- If slower, check Supabase response time
- Optimize by reducing unnecessary data transformations

### Tip 4: Set Up Error Notifications

Get alerted when workflows fail:
1. n8n Settings → Error Workflow
2. Create a workflow that sends you an email/Slack on errors
3. Activate error workflow globally

### Tip 5: Use Environment Variables

For production deployments:
- Store Supabase URL and keys as n8n environment variables
- Reference them in nodes: `{{ $env.SUPABASE_URL }}`
- Easier to manage across multiple workflows

---

## 🔒 Security Best Practices

✅ **DO**:
- Keep your service_role key secure in n8n credentials
- Use HTTPS for your n8n instance in production
- Set token expiration appropriately (7 days recommended)
- Monitor failed login attempts in Supabase

❌ **DON'T**:
- Never expose service_role key in frontend code
- Don't commit credentials to version control
- Don't use anon key for backend operations
- Don't disable Row Level Security without understanding impact

---

## 📚 Additional Resources

- **n8n Documentation**: [https://docs.n8n.io](https://docs.n8n.io)
- **Supabase REST API**: [https://supabase.com/docs/guides/api](https://supabase.com/docs/guides/api)
- **n8n Community**: [https://community.n8n.io](https://community.n8n.io)
- **n8n Templates**: Browse 1000+ workflow examples

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'n8n'"

**Solution**: Install n8n globally
```bash
npm install -g n8n
```

### Issue: Webhook returns 404

**Solution**: 
- Check workflow is activated (green toggle)
- Verify webhook URL is copied correctly to .env
- Restart React app after changing .env

### Issue: Email sent but not received

**Solution**:
- Check spam/junk folder
- Verify client_email is correct in payload
- Test by sending to your own email first
- Check Gmail credentials are valid

### Issue: Token not saving to database

**Solution**:
- Verify Supabase URL and service_role key
- Check `validation_tokens` table exists
- Ensure RLS policies allow service_role writes
- View n8n execution error details

### Issue: "Row Level Security" error

**Solution**:
Run this SQL in Supabase to allow service_role access:
```sql
CREATE POLICY "Service role full access"
ON validation_tokens FOR ALL
TO service_role
USING (true);
```

---

## 🎉 Success Checklist

Before going live, verify:

- [ ] Workflow imported successfully
- [ ] Supabase credentials configured
- [ ] Gmail/SMTP credentials working
- [ ] Test email received with correct validation link
- [ ] Token saved to database
- [ ] Webhook URL added to React .env
- [ ] Workflow activated (green toggle)
- [ ] Test submission from app works end-to-end
- [ ] Email template customized with company name
- [ ] Production n8n instance deployed (if applicable)

---

## 💰 Value Proposition

**What you get with this workflow**:

| If Built From Scratch | With This Boilerplate |
|-----------------------|----------------------|
| 8-12 hours development | ✅ 10 minutes setup |
| ~400 lines of Node.js code | ✅ Visual, no-code workflow |
| Email template from scratch | ✅ Professional HTML included |
| Token generation logic | ✅ Secure algorithm included |
| Database schema design | ✅ Pre-configured tables |
| Testing and debugging | ✅ Pre-tested and working |
| **Total: $800-1200** | **Included FREE** |

---

## 🤝 Need Help?

If you encounter issues not covered in this guide:

1. Check n8n execution logs for detailed error messages
2. Verify all credentials are correctly configured
3. Test each node individually using "Execute Node"
4. Contact support with screenshots of error messages

**Support**: support@yourdomain.com  
**Response time**: Usually within 24 hours

---

**Built with ❤️ to save you development time**

**Focus on your product, not on email workflows.**

🚀 **Happy automating!**