import React from 'react';
import { Layout, Container, Title, Text, Button } from '@sureapp/canary-design-system';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout
      display="flex-column"
      padding="large"
      gap="large"
      flexAlign="center"
      flexJustify="center"
    >
      <Container padding="large" background="surface">
        <Layout display="flex-column" gap="large" flexAlign="center">
          <Title variant="display-2" align="center">
            Canary Design System Templates
          </Title>

          <Text variant="body-large" align="center" color="subtle">
            Explore ready-to-use page templates built with the Canary Design System.
            These examples demonstrate real-world insurance purchase flows and layouts.
          </Text>

          <Layout display="flex-column" gap="medium" flexAlign="stretch">
            <Title variant="title-3" align="center">
              Auto Insurance Purchase Flow
            </Title>

            <Text variant="body-regular" align="center" color="subtle">
              Complete 5-page flow: Landing → Getting Started → Coverage → Checkout → Confirmation
            </Text>

            {/* Auto Insurance Landing */}
            <Layout display="flex-column" gap="small" padding="medium" background="1">
              <Title variant="title-4">1. Landing Page</Title>
              <Text variant="body-regular" color="subtle">
                Marketing landing page with hero section, feature showcase, FAQ accordion,
                and clear calls-to-action to start the quote process.
              </Text>
              <Button
                onClick={() => navigate('/auto-insurance/landing')}
                variant="primary"
                size="medium"
              >
                View Auto Insurance Landing
              </Button>
            </Layout>

            {/* Auto Insurance Getting Started */}
            <Layout display="flex-column" gap="small" padding="medium">
              <Title variant="title-4">2. Getting Started</Title>
              <Text variant="body-regular" color="subtle">
                Initial data collection for vehicle details, driver information, and address.
                Simple, streamlined form to get users started quickly.
              </Text>
              <Button
                onClick={() => navigate('/auto-insurance/getting-started')}
                variant="primary"
                size="medium"
              >
                View Getting Started
              </Button>
            </Layout>

            {/* Auto Insurance Coverage */}
            <Layout display="flex-column" gap="small" padding="medium" background="1">
              <Title variant="title-4">3. Coverage Selection</Title>
              <Text variant="body-regular" color="subtle">
                Interactive coverage customization with required liability, recommended collision/comprehensive,
                and optional add-ons. Real-time quote updates in sticky sidebar.
              </Text>
              <Button
                onClick={() => navigate('/auto-insurance/coverage')}
                variant="primary"
                size="medium"
              >
                View Coverage Page
              </Button>
            </Layout>

            {/* Auto Insurance Checkout */}
            <Layout display="flex-column" gap="small" padding="medium">
              <Title variant="title-4">4. Checkout</Title>
              <Text variant="body-regular" color="subtle">
                Payment processing with billing address options, terms acceptance,
                and final coverage summary before purchase.
              </Text>
              <Button
                onClick={() => navigate('/auto-insurance/checkout')}
                variant="primary"
                size="medium"
              >
                View Checkout Page
              </Button>
            </Layout>

            {/* Auto Insurance Confirmation */}
            <Layout display="flex-column" gap="small" padding="medium" background="1">
              <Title variant="title-4">5. Confirmation</Title>
              <Text variant="body-regular" color="subtle">
                Success page with policy details, next steps, and access to
                policy documents and digital ID cards.
              </Text>
              <Button
                onClick={() => navigate('/auto-insurance/confirmation')}
                variant="primary"
                size="medium"
              >
                View Confirmation Page
              </Button>
            </Layout>

            <Title variant="title-3" align="center" style={{ marginTop: '2rem' }}>
              AD&D Insurance Templates
            </Title>

            <Text variant="body-regular" align="center" color="subtle">
              Complete purchase flow for Accidental Death & Dismemberment insurance
            </Text>

            {/* Landing Page Example */}
            <Layout display="flex-column" gap="small" padding="medium" background="1">
              <Title variant="title-4">Landing Page</Title>
              <Text variant="body-regular" color="subtle">
                Marketing landing page with hero section, features showcase, FAQ, and closing CTA.
                Perfect for product marketing and lead generation.
              </Text>
              <Button
                onClick={() => navigate('/examples/landing-page')}
                variant="primary"
                size="medium"
              >
                View Landing Page
              </Button>
            </Layout>

            {/* Active Examples */}
            <Layout display="flex-column" gap="small" padding="medium">
              <Title variant="title-4">Getting Started Page</Title>
              <Text variant="body-regular">
                Initial page in purchase flow for collecting user information.
              </Text>
              <Button
                onClick={() => navigate('/examples/getting-started')}
                variant="primary"
                size="medium"
              >
                View Getting Started
              </Button>
            </Layout>

            {/* Purchase Flow Examples */}
            <Layout display="flex-column" gap="small" padding="medium">
              <Title variant="title-4">Coverage Page</Title>
              <Text variant="body-regular">
                Coverage configuration page for selecting insurance options and benefits.
                Features dynamic forms, quote card, and additional insureds management.
              </Text>
              <Button
                onClick={() => navigate('/examples/coverage')}
                variant="primary"
                size="medium"
              >
                View Coverage Page
              </Button>
            </Layout>

            <Layout display="flex-column" gap="small" padding="medium" background="1">
              <Title variant="title-4">Checkout Page</Title>
              <Text variant="body-regular">
                Checkout page with two-column layout for payment details and quote summary.
                Includes payment form, billing address, and terms validation.
              </Text>
              <Button
                onClick={() => navigate('/examples/checkout')}
                variant="primary"
                size="medium"
              >
                View Checkout Page
              </Button>
            </Layout>

            <Layout display="flex-column" gap="small" padding="medium">
              <Title variant="title-4">Confirmation Page</Title>
              <Text variant="body-regular">
                Success confirmation page showing policy details and purchase completion.
                Displays policy information, payment details, and next steps.
              </Text>
              <Button
                onClick={() => navigate('/examples/confirmation')}
                variant="primary"
                size="medium"
              >
                View Confirmation Page
              </Button>
            </Layout>
          </Layout>

          <Layout display="flex" gap="small" flexJustify="center">
            <Button
              onClick={() => navigate('/auto-insurance/landing')}
              variant="primary"
              size="medium"
            >
              Start Auto Insurance Flow
            </Button>
            <Button
              onClick={() => navigate('/examples/landing-page')}
              variant="support"
              size="medium"
            >
              View AD&D Flow
            </Button>
            <Button
              href="https://canarydesignsystem.com"
              variant="support"
              emphasis="subtle"
              size="medium"
            >
              Design System Docs
            </Button>
          </Layout>
        </Layout>
      </Container>
    </Layout>
  );
};

export default HomePage;
