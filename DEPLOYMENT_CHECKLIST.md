# Deployment Safety Checklist

## Pre-Deployment Testing

### 1. Staging Environment

- [ ] Deploy to staging environment first
- [ ] Test all chatbot functionality on staging
- [ ] Verify embed scripts work on test websites
- [ ] Check iframe functionality
- [ ] Test chat API endpoints
- [ ] Verify Redis connectivity

### 2. Health Checks

- [ ] Run health check: `GET /api/health`
- [ ] Verify Redis connection
- [ ] Test iframe endpoint accessibility
- [ ] Check rate limiting functionality

### 3. Embed Script Testing

- [ ] Test current embed script (`embed.js`)
- [ ] Test versioned embed script (`embed-v1.js`)
- [ ] Verify backward compatibility
- [ ] Test on different platforms (Squarespace, WordPress, etc.)

## Production Deployment

### 1. Environment Variables

- [ ] Verify all environment variables are set in Vercel
- [ ] Check OpenAI API key is valid
- [ ] Confirm Redis URL is correct
- [ ] Verify rate limiting settings

### 2. Deployment Process

- [ ] Deploy to production
- [ ] Monitor deployment logs for errors
- [ ] Run health check immediately after deployment
- [ ] Test chatbot on live website

### 3. Post-Deployment Verification

- [ ] Test chatbot functionality on external websites
- [ ] Verify chat history persistence
- [ ] Check rate limiting is working
- [ ] Monitor error logs for 15 minutes

## Rollback Procedures

### If Issues Are Detected

1. **Immediate Actions:**

   - [ ] Check Vercel deployment logs
   - [ ] Run health check endpoint
   - [ ] Test iframe endpoint directly

2. **Quick Fixes:**

   - [ ] Update environment variables if needed
   - [ ] Redeploy with fixes
   - [ ] Monitor for 10 minutes

3. **Full Rollback:**
   - [ ] Revert to previous deployment in Vercel
   - [ ] Verify previous version is working
   - [ ] Investigate issues in staging
   - [ ] Fix and test before redeploying

## Monitoring

### Key Metrics to Watch

- [ ] Response times for chat API
- [ ] Redis connection status
- [ ] Error rates in logs
- [ ] Rate limiting effectiveness
- [ ] Iframe loading success rate

### Alerts to Set Up

- [ ] Health check endpoint failures
- [ ] High error rates
- [ ] Redis connection failures
- [ ] OpenAI API failures

## Emergency Contacts

- Developer: [Your contact info]
- Hosting: Vercel support
- Redis: [Your Redis provider support]

## Version Management

### Current Versions

- **Production**: v1.0.0 (stable)
- **Staging**: [Current staging version]
- **Development**: [Current dev version]

### Embed Script URLs

- **Current**: `https://yogabot2.vercel.app/embed.js`
- **Versioned**: `https://yogabot2.vercel.app/embed-v1.js`
- **Staging**: `https://yogabot2-staging.vercel.app/embed.js`

## Testing Checklist for External Websites

### Before Each Deployment

- [ ] Test on Squarespace site
- [ ] Test on WordPress site
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify responsive design
- [ ] Check for JavaScript errors in console

### Critical Functionality Tests

- [ ] Chatbot opens and closes properly
- [ ] Messages send and receive correctly
- [ ] Chat history persists across sessions
- [ ] Rate limiting works as expected
- [ ] Styling appears correctly
- [ ] No conflicts with host website CSS
