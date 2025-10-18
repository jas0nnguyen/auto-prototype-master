import React, { useState } from 'react';
import {
  AppTemplate,
  PageHeader,
  AppHeader,
  Main,
  PageFooter,
  AppFooter,
  Content,
  Aside,
  Header,
  Button,
  Form,
  Section,
  DateInput,
  InputGroup,
  RadioButton,
  Block,
  TextInput,
  Switch,
  Text,
  QuoteCard,
  List,
  ChevronLeft,
  Plus,
  Link,
} from '@sureapp/canary-design-system';

// Logo for consistent branding
const logoSrc = '/images/sureMiniLogo.2be6cd5d.svg';

const CoveragePage: React.FC = () => {
  // State for form management
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [hasChild, setHasChild] = useState(false);
  const [children, setChildren] = useState<number[]>([]);
  const [medicalExpense, setMedicalExpense] = useState(false);
  const [criticalIllness, setCriticalIllness] = useState(false);

  // Event handlers
  const handleSpouse = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasSpouse(event.target.value === 'true');
  };

  const handleChild = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasChildValue = event.target.value === 'true';
    setHasChild(hasChildValue);
    if (hasChildValue && children.length === 0) {
      setChildren([0]);
    } else if (!hasChildValue) {
      setChildren([]);
    }
  };

  const handleAddChild = () => {
    setChildren([...children, children.length]);
  };

  const handleRemoveChild = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    setChildren(newChildren);
    if (newChildren.length === 0) {
      setHasChild(false);
    }
  };

  const handleMedicalExpense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMedicalExpense(event.target.checked);
  };

  const handleCriticalIllness = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCriticalIllness(event.target.checked);
  };

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
              breadcrumbs={
                <Button
                  href="/examples/getting-started"
                  emphasis="text"
                  startIcon={ChevronLeft}
                >
                  Back
                </Button>
              }
              hasBorder={false}
              hasPadding={false}
              supportText="Maximum benefit amount of $100,000 per Covered Person as the result of one accident will be paid to the policyholder or designated beneficiary."
              title="Confirm your AD&D coverage"
              titleSize="title-1"
            />
          </AppTemplate.Title>
          
          <Form
            buttonLabel="Next: Checkout"
            buttonProps={{
              href: "/examples/checkout",
            }}
          >
            <Section>
              <DateInput
                id="coverage-start-date"
                label="Coverage start date"
                placeholder="MM/DD/YYYY"
                size="small"
                date={date}
                setDate={setDate}
                helpText="Policy expires 01/01/2026"
              />
            </Section>

            <Section title="Additional insureds">
              <InputGroup
                label="Do you have a spouse or domestic partner to include on your policy?"
                id="spouse-question"
              >
                <RadioButton
                  id="no-spouse"
                  label="No"
                  name="partner"
                  checked={!hasSpouse}
                  value="false"
                  onChange={handleSpouse}
                />
                <RadioButton
                  id="yes-spouse"
                  label="Yes"
                  value="true"
                  name="partner"
                  checked={hasSpouse}
                  onChange={handleSpouse}
                />
              </InputGroup>
              
              {hasSpouse && (
                <Block
                  controls={
                    <Button
                      emphasis="text"
                      size="xsmall"
                      onClick={() => setHasSpouse(false)}
                    >
                      Remove
                    </Button>
                  }
                  title="Spouse/Domestic partner"
                >
                  <Form.Row layout="1-1-1">
                    <TextInput id="spouse-first-name" label="First name" size="small" />
                    <TextInput id="spouse-last-name" label="Last name" size="small" />
                    <TextInput id="spouse-dob" label="Date of birth" size="small" placeholder="MM/DD/YYYY" />
                  </Form.Row>
                </Block>
              )}
              
              <InputGroup label="Do you want to include child dependents on your policy?">
                <RadioButton
                  id="no-child"
                  label="No"
                  name="child"
                  checked={!hasChild}
                  value="false"
                  onChange={handleChild}
                />
                <RadioButton
                  id="yes-child"
                  label="Yes"
                  value="true"
                  name="child"
                  checked={hasChild}
                  onChange={handleChild}
                />
              </InputGroup>
              
              {children.map((childIndex) => (
                <Block
                  key={childIndex}
                  controls={
                    <Button
                      emphasis="text"
                      size="xsmall"
                      onClick={() => handleRemoveChild(childIndex)}
                    >
                      Remove
                    </Button>
                  }
                  title={`Child dependent ${childIndex + 1}`}
                >
                  <Form.Row layout="1-1-1">
                    <TextInput id={`child-${childIndex}-first-name`} label="First name" size="small" />
                    <TextInput id={`child-${childIndex}-last-name`} label="Last name" size="small" />
                    <TextInput id={`child-${childIndex}-dob`} label="Date of birth" size="small" placeholder="MM/DD/YYYY" />
                  </Form.Row>
                </Block>
              ))}
              
              {hasChild && (
                <Button
                  size="small"
                  startIcon={Plus}
                  variant="support"
                  onClick={handleAddChild}
                >
                  Add another dependent
                </Button>
              )}
            </Section>

            <Section title="Additional benefits">
              <Block
                controls={
                  <Switch
                    id="medical-expense"
                    name="medical-expense"
                    checked={medicalExpense}
                    onChange={handleMedicalExpense}
                  />
                }
                supportText="$5,000 limit, $0 deductible, 0% coinsurance"
                title="Accident Medical Expense"
                tooltipText="Additional coverage information"
              >
                <Text color="normal" variant="body-small">
                  After a covered accident, the Accident Medical Expense Plan pays cash
                  reimbursements after you pay the plan deductible toward a variety of
                  medical treatments and expenses not covered by your major medical plan
                  or any other insurance.
                </Text>
              </Block>
              
              <Block
                controls={
                  <Switch
                    id="critical-illness"
                    name="critical-illness"
                    checked={criticalIllness}
                    onChange={handleCriticalIllness}
                  />
                }
                supportText="$7,500"
                title="Critical Illness"
                tooltipText="Critical illness coverage details"
              >
                <Text color="normal" variant="body-small">
                  Critical Illness Insurance provides cash benefits for defined
                  illnesses or specified diseases to help cover out-of-pocket medical
                  and other non-medical expenses when diagnosed with a covered illness
                  or disease. You can use the lump sum benefit payment for any purpose
                  they choose: deductibles, child care, transportation costs for
                  themselves or family members, loss of income, or any other financial
                  need.
                </Text>
              </Block>
            </Section>
          </Form>
        </Content>
        
        <Aside>
          <QuoteCard price="9.35" total="9.35">
            <Button emphasis="strong" href="/" size="xsmall" variant="support">
              View sample policy
            </Button>
            <List title="Individual AD&D">
              <List.Row>
                <List.Item>$100,000 limit</List.Item>
              </List.Row>
            </List>
            {medicalExpense && (
              <List title="Additional Medical Expense">
                <List.Row>
                  <List.Item>$5,000 limit</List.Item>
                </List.Row>
                <List.Row>
                  <List.Item>$0 deductible</List.Item>
                </List.Row>
                <List.Row>
                  <List.Item>0% coinsurance</List.Item>
                </List.Row>
              </List>
            )}
            {criticalIllness && (
              <List title="Critical Illness">
                <List.Row>
                  <List.Item>$7,500 limit</List.Item>
                </List.Row>
              </List>
            )}
          </QuoteCard>
        </Aside>
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

export default CoveragePage; 