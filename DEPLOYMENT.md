# Production Deployment Checklist

## Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Supabase production database configured
- [ ] RLS policies tested
- [ ] Database indexes created
- [ ] Stripe webhook endpoint configured with live keys
- [ ] Groq API key (free tier has limits - consider upgrade)
- [ ] SSL certificate active (Vercel auto)

## Security Checks

- [ ] No API keys in code
- [ ] Webhook signature verification working
- [ ] CORS headers configured
- [ ] Rate limiting tested
- [ ] SQL injection protection verified
- [ ] XSS protection enabled

## Performance

- [ ] Database queries optimized with indexes
- [ ] API routes return within 5s
- [ ] Images optimized (if any)
- [ ] Lighthouse score > 90

## Testing

- [ ] Auth flow (signup/login/logout)
- [ ] Task submission
- [ ] AI evaluation works
- [ ] Payment flow (test mode)
- [ ] Webhook processing
- [ ] Mobile responsive

## Monitoring

- [ ] Vercel Analytics enabled
- [ ] Sentry or error tracking setup (optional)
- [ ] Stripe Dashboard monitoring
- [ ] Supabase logs review

## Post-Deployment

- [ ] Test with real Stripe test card: 4242 4242 4242 4242
- [ ] Verify webhook in Stripe Dashboard
- [ ] Check Supabase database updates
- [ ] Monitor Groq API usage
