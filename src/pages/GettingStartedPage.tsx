import React from 'react';
import {
  AppTemplate,
  PageHeader,
  AppHeader,
  Main,
  PageFooter,
  AppFooter,
  Content,
  Header,
  Form,
  Section,
  TextInput,
  Select,
  Link,
  Text,
} from '@sureapp/canary-design-system';

// Logo for consistent branding
const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

// State options for the form
const states = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  // Add more states as needed
];

const GettingStartedPage: React.FC = () => {
  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader 
          logo={logoSrc}
          logoHref="/examples/landing-page"
        />
      </PageHeader>
      
      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              hasBorder={false}
              hasPadding={false}
              supportText="We just need a few things from you to get you a quote."
              title="Get pricing for AD&D Coverage!"
              titleSize="title-1"
            />
          </AppTemplate.Title>
          
          <Form
            buttonLabel="Get started"
            buttonProps={{
              href: "/examples/coverage",
            }}
          >
            <Section>
              <Form.Group preset="address-group">
                <TextInput id="address" label="Address" size="small" />
                <TextInput
                  id="apt"
                  label="Apartment, unit, suite, etc."
                  size="small"
                />
                <TextInput id="city" label="City" size="small" />
                <Select id="state" label="State" size="small" options={states} />
                <TextInput id="zip" label="Zip code" size="small" />
              </Form.Group>
            </Section>

            <Section title="Last thing — tell us about yourself">
              <Form.Group preset="user-group">
                <TextInput id="first-name" label="First name" size="small" />
                <TextInput id="last-name" label="Last name" size="small" />
                <Select
                  id="gender"
                  label="Gender"
                  size="small"
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                  ]}
                />
                <TextInput id="email" label="Email" size="small" />
                <TextInput
                  id="dob"
                  label="Date of birth"
                  size="small"
                  placeholder="MM/DD/YYYY"
                />
              </Form.Group>
            </Section>
          </Form>
        </Content>
      </Main>

      <PageFooter>
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
      </PageFooter>
    </AppTemplate>
  );
};

export default GettingStartedPage; 