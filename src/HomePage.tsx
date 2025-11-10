import React, { useEffect } from 'react';
import { Layout, Container, Title, Text, Button } from '@sureapp/canary-design-system';
import { useNavigate } from 'react-router-dom';
import { clearActiveFlow, setActiveFlow } from './utils/flowTracker';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Clear any active flow when landing on home page (T050)
  useEffect(() => {
    clearActiveFlow();
  }, []);

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
            Auto Insurance Quote System
          </Title>

          <Text variant="body-large" align="center" color="subtle">
            Choose between our classic quote experience or try the new modern flow.
          </Text>

          {/* Flow Selector (T049, T051 - Feature 004) */}
          <Layout display="flex-column" gap="medium" padding="large" background="1">
            <Title variant="title-3" align="center">
              Choose Your Flow
            </Title>
            <Text variant="body-regular" align="center" color="subtle">
              Select the classic quote flow or experience our modern tech startup design.
            </Text>
            <Layout display="flex" gap="medium" flexJustify="center">
              <Button
                onClick={() => {
                  setActiveFlow('classic');
                  navigate('/auto-insurance/landing');
                }}
                variant="primary"
                size="large"
              >
                Classic Flow (Default)
              </Button>
              <Button
                onClick={() => {
                  setActiveFlow('tech-startup');
                  navigate('/quote-v2/get-started');
                }}
                variant="support"
                size="large"
              >
                Modern Flow (New!)
              </Button>
            </Layout>
          </Layout>
        </Layout>
      </Container>
    </Layout>
  );
};

export default HomePage;
