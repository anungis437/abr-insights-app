import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface NewsletterWelcomeEmailProps {
  firstName?: string
}

export default function NewsletterWelcomeEmail({
  firstName,
}: NewsletterWelcomeEmailProps) {
  const displayName = firstName || 'there'
  
  return (
    <Html>
      <Head />
      <Preview>Welcome to ABR Insights Newsletter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to ABR Insights! 🎉</Heading>
          
          <Text style={text}>
            Hi {displayName},
          </Text>
          
          <Text style={text}>
            Thank you for subscribing to the ABR Insights newsletter! We&apos;re excited to have you join our community committed to advancing anti-racism and human rights excellence.
          </Text>
          
          <Section style={highlightBox}>
            <Text style={highlightTitle}>
              What to expect from us:
            </Text>
            <Text style={highlightText}>
              ✓ Latest updates on anti-racism training and resources<br />
              ✓ Case law insights and tribunal decision analyses<br />
              ✓ Best practices for workplace equity and inclusion<br />
              ✓ Exclusive content and early access to new courses<br />
              ✓ Tips from human rights experts
            </Text>
          </Section>
          
          <Text style={text}>
            Our newsletter is published monthly, delivering valuable insights directly to your inbox. We respect your time and privacy&mdash;no spam, just quality content.
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href="https://abrinsights.ca/training">
              Explore Our Training
            </Button>
          </Section>
          
          <Text style={text}>
            Have questions or feedback? Simply reply to this email&mdash;we&apos;d love to hear from you!
          </Text>
          
          <Text style={text}>
            Best regards,<br />
            The ABR Insights Team
          </Text>
          
          <Text style={footer}>
            © {new Date().getFullYear()} ABR Insights. All rights reserved.<br />
            You&apos;re receiving this because you subscribed to our newsletter.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  marginBottom: '24px',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const highlightBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
}

const highlightTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  marginBottom: '12px',
}

const highlightText = {
  color: '#484848',
  fontSize: '15px',
  lineHeight: '24px',
  margin: 0,
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '18px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
