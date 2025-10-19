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

// Image paths
const heroImage = '/images/placeholder-image.jpg';
const featureImage1 = '/images/feature1.svg';
const featureImage2 = '/images/feature2.svg';
const featureImage3 = '/images/feature2.svg';
const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

const AutoInsuranceLandingPage: React.FC = () => {
  return (
    <AppTemplate preset="landing-page">
      <AppTemplate.Header>
        <AppHeader
          controlMenu={
            <ButtonGroup>
              <Button emphasis="subtle" size="medium" variant="support">
                Log in
              </Button>
              <Button size="medium" variant="primary" href="/auto-insurance/getting-started">
                Get my quote
              </Button>
            </ButtonGroup>
          }
          mobileMenu={
            <Section>
              <ButtonGroup align="left">
                <Button size="small" variant="support">
                  Log in
                </Button>
                <Button size="small" variant="primary" href="/auto-insurance/getting-started">
                  Get my quote
                </Button>
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
            <Button size="large" variant="primary" href="/auto-insurance/getting-started">
              Get my quote
            </Button>
          }
          overline="Modern Auto Insurance"
          supportText="Save money with smart coverage designed for how you actually drive. Get an instant quote and see how much you can save."
          title="Car Insurance That Actually Makes Sense"
          image={<Image src={heroImage} alt="Auto Insurance Hero" fit="cover" />}
        />

        {/* Features section */}
        <AppTemplate.Content>
          <Section>
            <Layout display="flex-column" gap="large">
              <Title align="center" variant="display-2" as="h2">
                Why Choose Our Auto Insurance?
              </Title>
              <Text align="center" variant="body-large">
                Modern coverage options, transparent pricing, and instant quotes.
              </Text>
            </Layout>
            <Layout gap="section" grid="1-1-1">
              <Layout display="flex-column" gap="large">
                <Image
                  maxWidth="277px"
                  src={featureImage1}
                  alt="Instant quotes feature"
                />
                <Layout display="flex-column" gap="small">
                  <Title variant="title-2" as="h3">Instant Quotes</Title>
                  <Text variant="body-regular">
                    Get your personalized rate in minutes. No phone calls, no hassle.
                    Compare coverage options and see exactly what you're paying for.
                  </Text>
                </Layout>
              </Layout>
              <Layout display="flex-column" gap="large">
                <Image
                  maxWidth="277px"
                  src={featureImage2}
                  alt="Modern coverage feature"
                />
                <Layout display="flex-column" gap="small">
                  <Title variant="title-2" as="h3">Modern Coverage</Title>
                  <Text variant="body-regular">
                    Coverage designed for today's drivers. Including rideshare gap protection,
                    new car replacement, and flexible rental reimbursement options.
                  </Text>
                </Layout>
              </Layout>
              <Layout display="flex-column" gap="large">
                <Image
                  maxWidth="277px"
                  src={featureImage3}
                  alt="Easy management feature"
                />
                <Layout display="flex-column" gap="small">
                  <Title variant="title-2" as="h3">Easy Management</Title>
                  <Text variant="body-regular">
                    Manage your policy online 24/7. Update coverage, add vehicles or drivers,
                    and access ID cards instantly from any device.
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
                    Find answers to your auto insurance questions here, or click
                    'Contact us' for personalized help.
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
                <Accordion title="What affects my auto insurance rate?">
                  Your rate is based on factors like your age, driving history, location,
                  vehicle type, coverage levels, and annual mileage. We also consider your
                  credit score in most states. Safe drivers with good credit typically get
                  our best rates.
                </Accordion>
                <Accordion title="What coverage do I need?">
                  At minimum, you need liability coverage (required by law in most states).
                  We recommend adding collision and comprehensive coverage if you have a newer
                  vehicle or car loan. Consider uninsured motorist coverage for extra protection.
                </Accordion>
                <Accordion title="Can I get coverage for rideshare driving?">
                  Yes! We offer specialized rideshare gap coverage that protects you during
                  periods when your rideshare app is on but you haven't accepted a ride yet.
                  This fills the gap between your personal policy and the rideshare company's coverage.
                </Accordion>
                <Accordion title="How quickly can coverage start?">
                  Coverage can start as soon as today! Once you complete your purchase and
                  payment is processed, your policy becomes active. You'll receive your
                  policy documents and digital ID cards via email within minutes.
                </Accordion>
                <Accordion title="Can I add multiple vehicles?">
                  Absolutely! You can insure up to 5 vehicles on a single policy and save
                  with our multi-vehicle discount. You'll save time and money by bundling
                  all your vehicles together.
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
                Get your personalized auto insurance <br />
                quote in just 5 minutes.
              </Title>
              <Button href="/auto-insurance/getting-started" size="large" variant="primary">
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
              Auto insurance quotes provided through AutoProtect Insurance Services, LLC,
              a licensed insurance producer. All descriptions or illustrations of coverage are
              provided for general informational purposes only and do not in any way alter or
              amend the terms, conditions, or exclusions of any insurance policy.
            </Text>
            <Text variant="caption-small">
              Not all coverage options are available in all states. Coverage is subject to
              underwriting approval and policy terms. Premium estimates based on information
              provided and may change based on additional underwriting factors. Final rates
              determined at time of policy issuance.
            </Text>
          </>
        </AppFooter>
      </AppTemplate.Footer>
    </AppTemplate>
  );
};

export default AutoInsuranceLandingPage;
