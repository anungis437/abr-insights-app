import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ContactConfirmationEmailProps {
  name: string
  subject: string
}

export default function ContactConfirmationEmail({
  name,
  subject,
}: ContactConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for contacting ABR Insights</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank You for Reaching Out</Heading>
          
          <Text style={text}>
            Hi {name},
          </Text>
          
          <Text style={text}>
            We've received your message regarding "{subject}" and appreciate you taking the time to contact us.
          </Text>
          
          <Text style={text}>
            Our team will review your inquiry and get back to you within 1-2 business days. We're committed to providing you with the support and information you need.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>What happens next?</strong>
            </Text>
            <Text style={infoText}>
              • Our team reviews your message<br />
              • We research the best solution for your needs<br />
              • You receive a personalized response
            </Text>
          </Section>
          
          <Text style={text}>
            In the meantime, feel free to explore our resources and training materials.
          </Text>
          
          <Text style={text}>
            Best regards,<br />
            The ABR Insights Team
          </Text>
          
          <Text style={footer}>
            © {new Date().getFullYear()} ABR Insights. All rights reserved.
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

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
  marginBottom: '24px',
}

const infoText = {
  color: '#484848',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
