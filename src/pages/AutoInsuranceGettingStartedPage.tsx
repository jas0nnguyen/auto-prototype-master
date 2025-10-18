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

const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

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
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Texas', value: 'TX' },
  { label: 'New York', value: 'NY' },
];

const AutoInsuranceGettingStartedPage: React.FC = () => {
  return (
    <AppTemplate preset="purchase-flow">
      <PageHeader>
        <AppHeader
          logo={logoSrc}
          logoHref="/auto-insurance/landing"
        />
      </PageHeader>

      <Main>
        <Content>
          <AppTemplate.Title>
            <Header
              hasBorder={false}
              hasPadding={false}
              supportText="We just need a few details to get you started. This will take about 2 minutes."
              title="Let's Get You a Quote!"
              titleSize="title-1"
            />
          </AppTemplate.Title>

          <Form
            buttonLabel="Continue"
            buttonProps={{
              href: "/auto-insurance/coverage",
            }}
          >
            <Section title="Your Vehicle">
              <Select
                id="vehicle-year"
                label="Year"
                size="small"
                placeholder="Select year"
                options={[
                  { label: '2024', value: '2024' },
                  { label: '2023', value: '2023' },
                  { label: '2022', value: '2022' },
                  { label: '2021', value: '2021' },
                  { label: '2020', value: '2020' },
                  { label: '2019', value: '2019' },
                  { label: '2018', value: '2018' },
                  { label: '2017', value: '2017' },
                  { label: '2016', value: '2016' },
                ]}
              />
              <Select
                id="vehicle-make"
                label="Make"
                size="small"
                placeholder="Select make"
                options={[
                  { label: 'Toyota', value: 'toyota' },
                  { label: 'Honda', value: 'honda' },
                  { label: 'Ford', value: 'ford' },
                  { label: 'Chevrolet', value: 'chevrolet' },
                  { label: 'Nissan', value: 'nissan' },
                  { label: 'Tesla', value: 'tesla' },
                  { label: 'BMW', value: 'bmw' },
                  { label: 'Mercedes-Benz', value: 'mercedes' },
                ]}
              />
              <TextInput
                id="vehicle-model"
                label="Model"
                size="small"
                placeholder="e.g., Camry"
              />
              <TextInput
                id="vehicle-vin"
                label="VIN (Optional)"
                size="small"
                placeholder="17-character VIN"
                helpText="Vehicle Identification Number - helps us get you the most accurate quote"
              />
            </Section>

            <Section title="About You">
              <TextInput
                id="first-name"
                label="First name"
                size="small"
                placeholder="John"
              />
              <TextInput
                id="last-name"
                label="Last name"
                size="small"
                placeholder="Smith"
              />
              <TextInput
                id="dob"
                label="Date of birth"
                size="small"
                placeholder="MM/DD/YYYY"
              />
              <Select
                id="gender"
                label="Gender"
                size="small"
                placeholder="Select gender"
                options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                  { label: 'Other', value: 'other' },
                ]}
              />
              <Select
                id="marital-status"
                label="Marital status"
                size="small"
                placeholder="Select marital status"
                options={[
                  { label: 'Single', value: 'single' },
                  { label: 'Married', value: 'married' },
                  { label: 'Divorced', value: 'divorced' },
                  { label: 'Widowed', value: 'widowed' },
                ]}
              />
              <TextInput
                id="email"
                label="Email"
                size="small"
                placeholder="john.smith@example.com"
              />
            </Section>

            <Section title="Where do you live?">
              <Form.Group preset="address-group">
                <TextInput
                  id="address"
                  label="Street address"
                  size="small"
                  placeholder="123 Main St"
                />
                <TextInput
                  id="apt"
                  label="Apartment, suite, etc."
                  size="small"
                />
                <TextInput
                  id="city"
                  label="City"
                  size="small"
                  placeholder="Los Angeles"
                />
                <Select
                  id="state"
                  label="State"
                  size="small"
                  placeholder="Select state"
                  options={states}
                />
                <TextInput
                  id="zip"
                  label="ZIP code"
                  size="small"
                  placeholder="90001"
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
              Auto insurance quotes provided through AutoProtect Insurance Services, LLC,
              a licensed insurance producer. Your information is encrypted and secure.
            </Text>
            <Text variant="caption-small">
              By continuing, you agree to receive quotes and marketing communications.
              You can opt out at any time. Coverage subject to underwriting approval.
            </Text>
          </>
        </AppFooter>
      </PageFooter>
    </AppTemplate>
  );
};

export default AutoInsuranceGettingStartedPage;
