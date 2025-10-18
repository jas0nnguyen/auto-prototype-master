import React from 'react';
import {
  AppTemplate,
  AppHeader,
  AppFooter,
  Hero,
  Button,
  ButtonGroup,
  Text,
  Title,
  Link,
  Section,
  Layout,
  Image,
  Content,
  Accordion,
} from '@sureapp/canary-design-system';

// Image paths - replace these with your actual images
const heroImage = '/images/placeholder-image.jpg';  // Hero placeholder image
const featureImage1 = '/images/feature1.svg';  // Purchase feature image
const featureImage2 = '/images/feature2.svg';  // Manage feature image  
const featureImage3 = '/images/feature2.svg';  // Claim feature image
const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';  // Sure company logo

const LandingPage: React.FC = () => {
  return (
    <AppTemplate preset="landing-page">
      <AppTemplate.Header>
        <AppHeader
          controlMenu={
            <ButtonGroup>
              <Button emphasis="subtle" size="medium" variant="support">
                Log in
              </Button>
              <Button size="medium" variant="primary">Get my quote</Button>
            </ButtonGroup>
          }
          mobileMenu={
            <Section>
              <ButtonGroup align="left">
                <Button size="small" variant="support">
                  Log in
                </Button>
                <Button size="small" variant="primary">Get my quote</Button>
              </ButtonGroup>
            </Section>
          }
          logoHref="/"
          logo={logoSrc}
        />
      </AppTemplate.Header>
      
      <AppTemplate.Main>
        {/* Hero section */}
        <Hero
          cta={
            <Button size="large" variant="primary" href="/examples/getting-started">
              Get my quote
            </Button>
          }
          overline="Accidental Death & Dismemberment insurance"
          supportText="Insure what matters most for you and your family with comprehensive accident coverage; all you have to do is enroll."
          title="Insure what matters most with AD&D Insurance"
          image={<Image src={heroImage} alt="AD&D Insurance Hero" fit="cover" />}
        />

        {/* Features section */}
        <AppTemplate.Content>
          <Section>
            <Layout display="flex-column" gap="large">
              <Title align="center" variant="display-2" as="h2">
                Features
              </Title>
              <Text align="center" variant="body-large">
                Purchase, manage your policy, and submit a claim easily.
              </Text>
            </Layout>
            <Layout gap="section" grid="1-1-1">
              <Layout display="flex-column" gap="large">
                <Image
                  maxWidth="277px"
                  src={featureImage1}
                  alt="Purchase feature"
                />
                <Layout display="flex-column" gap="small">
                  <Title variant="title-2" as="h3">Purchase</Title>
                  <Text variant="body-regular">
                    Select the best policy for you and your family, make coverage
                    selections, and checkout to bind your policy.
                  </Text>
                </Layout>
              </Layout>
              <Layout display="flex-column" gap="large">
                <Image
                  maxWidth="277px"
                  src={featureImage2}
                  alt="Manage feature"
                />
                <Layout display="flex-column" gap="small">
                  <Title variant="title-2" as="h3">Manage</Title>
                  <Text variant="body-regular">
                    Securely log-in to manage your policy and profile, edit
                    payment information, access policy docs, and submit claims.
                  </Text>
                </Layout>
              </Layout>
              <Layout display="flex-column" gap="large">
                <Image
                  maxWidth="277px"
                  src={featureImage3}
                  alt="Claim feature"
                />
                <Layout display="flex-column" gap="small">
                  <Title variant="title-2" as="h3">Claim</Title>
                  <Text variant="body-regular">
                    Start a claim or view status of an existing claim.
                  </Text>
                </Layout>
              </Layout>
            </Layout>
          </Section>
        </AppTemplate.Content>

        {/* FAQ section */}
        <Content className="bg-background-1">
          <Section>
            <Layout
              className="cdl-css__faq"
              display="flex"
              flexAlign="start"
              gap="template"
            >
              <Layout display="flex-column" gap="template">
                <Layout display="flex-column" gap="large">
                  <Title variant="display-2" as="h2">Frequently asked questions</Title>
                  <Text variant="body-large">
                    Find answers to your insurance questions here, or click
                    'Contact us' for help with your policy.
                  </Text>
                </Layout>
                <Button size="large" variant="support">
                  Contact us
                </Button>
              </Layout>
              <Layout
                className="accordions"
                display="flex-column"
                flexAlign="stretch"
                gap="xsmall"
              >
                <Accordion title="What is AD&D Insurance?">
                  If you or your family members suffer from an accident that
                  results in death or dismemberment, the impact can be
                  catastrophic. This personal accident insurance provides accident
                  protection on a 24/7 basis, regardless of health history.
                </Accordion>
                <Accordion title="When will my coverage become effective?">
                  Your coverage will become effective immediately upon policy approval and payment processing.
                </Accordion>
                <Accordion title="How will I receive my policy documents?">
                  All policy documents will be sent to your email address and will also be available in your online account.
                </Accordion>
                <Accordion title="Can I cover my family in addition to myself?">
                  Yes, you can add family members to your policy for additional coverage at competitive rates.
                </Accordion>
                <Accordion title="Are there any enrollment restrictions?">
                  Basic health questions may apply, but coverage is generally available regardless of health history.
                </Accordion>
              </Layout>
            </Layout>
          </Section>
        </Content>

        {/* Closing section */}
        <AppTemplate.Content>
          <Section>
            <Layout display="flex-column" flexAlign="center" gap="section">
              <Title align="center" variant="display-2" as="h2">
                Insure yourself and family by starting <br />
                your online quote today.
              </Title>
              <Button href="/examples/getting-started" size="large" variant="primary">
                Get my quote
              </Button>
            </Layout>
          </Section>
        </AppTemplate.Content>
      </AppTemplate.Main>

      <AppTemplate.Footer>
        <AppFooter
          logo={logoSrc}
          links={
            <>
              <Link href="/" size="xsmall">
                Privacy Policy
              </Link>
              <Link href="/" size="xsmall">
                Terms of Use
              </Link>
            </>
          }
        >
          <>
            <Text variant="caption-small">
              The sale of insurance products on this website is offered through
              Sure HIIS Insurance Services, LLC ("Sure"), a licensed insurance
              producer. All descriptions or illustrations of coverage are
              provided for general informational purposes only and do not in any
              way alter or amend the terms, conditions, or exclusions of any
              insurance policy. Sure is compensated by Chubb for its services.
            </Text>
            <Text variant="caption-small">
              Chubb is the marketing name used to refer to subsidiaries of Chubb
              Limited providing insurance and related services. For a list of
              these subsidiaries, please visit our website at www.chubb.com.
              Insurance provided by either ACE American Insurance Company or
              Federal Insurance Company and its U.S.-based Chubb underwriting
              company affiliates. All products may not be available in all
              states. This communication contains product summaries only.
              Coverage is subject to the language of the policies as actually
              issued. Surplus lines insurance sold only through licensed surplus
              lines producers. Chubb, 202 Hall's Mill Road, Whitehouse Station,
              NJ 08889-1600.
            </Text>
          </>
        </AppFooter>
      </AppTemplate.Footer>
    </AppTemplate>
  );
};

export default LandingPage; 