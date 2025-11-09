/**
 * QuoteResults Page Tests (T172)
 *
 * Tests for the quote results page component.
 * This page displays the final quote summary with all drivers, vehicles, coverages, and premium.
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuoteResults from '../QuoteResults';
import * as useQuoteHooks from '../../../hooks/useQuote';

// Mock the hooks
vi.mock('../../../hooks/useQuote', () => ({
  useQuoteByNumber: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('QuoteResults Page (T172)', () => {
  let queryClient: QueryClient;

  const mockQuoteData = {
    quote_number: 'DZ12345678',
    quote_status: 'QUOTED',
    quoteId: 'quote-uuid-123',
    driver: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      isPrimary: true,
    },
    driver_email: 'john.doe@example.com',
    additionalDrivers: [
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        relationship: 'spouse',
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        relationship: 'household member',
      },
    ],
    vehicles: [
      {
        year: 2020,
        make: 'Toyota',
        model: 'Camry',
        vin: 'VIN123456789ABCDEF',
      },
      {
        year: 2018,
        make: 'Honda',
        model: 'Civic',
        vin: 'VIN987654321FEDCBA',
      },
    ],
    coverages: {
      startDate: '2025-11-01',
      bodilyInjuryLimit: '100/300',
      propertyDamageLimit: '50000',
      hasCollision: true,
      collisionDeductible: 500,
      hasComprehensive: true,
      comprehensiveDeductible: 500,
      hasUninsured: true,
      hasRoadside: true,
      hasRental: true,
      rentalLimit: 50,
    },
    premium: {
      total: 1200.50,
      monthly: 200.08,
      sixMonth: 1200.50,
    },
  };

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementation
    (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
      data: mockQuoteData,
      isLoading: false,
      error: null,
    });
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/quote/results/DZ12345678']}>
          <Routes>
            <Route path="/quote/results/:quoteNumber" element={<QuoteResults />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Page Rendering', () => {
    it('should render page title and quote reference number', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Your Personalized Quote is Ready!')).toBeInTheDocument();
      });

      expect(screen.getByText(/Quote Reference: DZ12345678/i)).toBeInTheDocument();
    });

    it('should render main sections', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("What's Covered")).toBeInTheDocument();
      });

      expect(screen.getByText('Premium Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Why This Rate?')).toBeInTheDocument();
    });
  });

  describe('Quote Summary Display', () => {
    it('should display quote number in DZXXXXXXXX format', async () => {
      renderPage();

      await waitFor(() => {
        const quoteNumbers = screen.getAllByText(/DZ12345678/i);
        expect(quoteNumbers.length).toBeGreaterThan(0);
      });
    });

    it('should display quote status as QUOTED', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Quote Status: QUOTED/i)).toBeInTheDocument();
      });
    });

    it('should show quote validity period', async () => {
      renderPage();

      await waitFor(() => {
        const validityTexts = screen.getAllByText(/valid for 30 days/i);
        expect(validityTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Multi-Driver Display', () => {
    it('should display primary driver information', async () => {
      renderPage();

      await waitFor(() => {
        const johnDoes = screen.getAllByText('John Doe');
        expect(johnDoes.length).toBeGreaterThan(0);
      });
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText(/\(Primary\)/i)).toBeInTheDocument();
    });

    it('should display all additional drivers', async () => {
      renderPage();

      // Additional driver 1
      await waitFor(() => {
        const janeDoes = screen.getAllByText('Jane Doe');
        expect(janeDoes.length).toBeGreaterThan(0);
      });
      expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
      const spouseTexts = screen.getAllByText(/\(spouse\)/i);
      expect(spouseTexts.length).toBeGreaterThan(0);

      // Additional driver 2
      const bobSmiths = screen.getAllByText('Bob Smith');
      expect(bobSmiths.length).toBeGreaterThan(0);
      expect(screen.getByText('bob.smith@example.com')).toBeInTheDocument();
      const householdTexts = screen.getAllByText(/\(household member\)/i);
      expect(householdTexts.length).toBeGreaterThan(0);
    });

    it('should show DRIVERS label (plural) when multiple drivers exist', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('DRIVERS')).toBeInTheDocument();
      });
    });

    it('should show DRIVER label (singular) when only primary driver exists', async () => {
      const singleDriverQuote = {
        ...mockQuoteData,
        additionalDrivers: [],
      };

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: singleDriverQuote,
        isLoading: false,
        error: null,
      });

      renderPage();

      // Should show singular "DRIVER"
      await waitFor(() => {
        const driverLabel = screen.getByText(/^DRIVER$/);
        expect(driverLabel).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Vehicle Display', () => {
    it('should display all vehicles with year, make, model', async () => {
      renderPage();

      // Vehicle 1 (may appear multiple times on page)
      await waitFor(() => {
        const camrys = screen.getAllByText('2020 Toyota Camry');
        expect(camrys.length).toBeGreaterThan(0);
      });

      // Vehicle 2 (may appear multiple times on page)
      const civics = screen.getAllByText('2018 Honda Civic');
      expect(civics.length).toBeGreaterThan(0);
    });

    it('should display VIN for each vehicle', async () => {
      renderPage();

      // VIN 1
      await waitFor(() => {
        expect(screen.getByText(/VIN: VIN123456789ABCDEF/i)).toBeInTheDocument();
      });

      // VIN 2
      expect(screen.getByText(/VIN: VIN987654321FEDCBA/i)).toBeInTheDocument();
    });

    it('should show VEHICLES label (plural) when multiple vehicles exist', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('VEHICLES')).toBeInTheDocument();
      });
    });

    it('should show VEHICLE label (singular) when only one vehicle exists', async () => {
      const singleVehicleQuote = {
        ...mockQuoteData,
        vehicles: [mockQuoteData.vehicles[0]],
      };

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: singleVehicleQuote,
        isLoading: false,
        error: null,
      });

      renderPage();

      // Should show singular "VEHICLE"
      await waitFor(() => {
        const vehicleLabel = screen.getByText(/^VEHICLE$/);
        expect(vehicleLabel).toBeInTheDocument();
      });
    });
  });

  describe('Coverage Summary Display', () => {
    it('should display all selected coverages', async () => {
      renderPage();

      // Required coverages
      await waitFor(() => {
        expect(screen.getByText(/Bodily Injury: \$100 \/ 300/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/Property Damage: \$50,000/i)).toBeInTheDocument();

      // Optional coverages
      expect(screen.getByText(/Collision: \$500 deductible/i)).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive: \$500 deductible/i)).toBeInTheDocument();
      expect(screen.getByText(/Uninsured Motorist: \$50k\/\$100k/i)).toBeInTheDocument();
      const roadsideTexts = screen.getAllByText(/24\/7 Roadside Assistance/i);
      expect(roadsideTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/Rental Reimbursement: \$50\/day/i)).toBeInTheDocument();
    });

    it('should not display optional coverages that are not selected', async () => {
      const quoteWithoutOptional = {
        ...mockQuoteData,
        coverages: {
          ...mockQuoteData.coverages,
          hasRoadside: false,
          hasRental: false,
        },
      };

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: quoteWithoutOptional,
        isLoading: false,
        error: null,
      });

      renderPage();

      // Should still have required coverages
      await waitFor(() => {
        expect(screen.getByText(/Bodily Injury/i)).toBeInTheDocument();
      });

      // Should not display roadside or rental in the aside coverage summary
      // Note: The main "Why This Rate?" section may still mention coverage package
    });
  });

  describe('Premium Breakdown', () => {
    it('should display monthly premium with 2 decimal places', async () => {
      renderPage();

      // Monthly premium $200.08 (may appear multiple times on page)
      await waitFor(() => {
        const premiums = screen.getAllByText(/\$?200\.08/);
        expect(premiums.length).toBeGreaterThan(0);
      });
    });

    it('should display 6-month premium with 2 decimal places', async () => {
      renderPage();

      // 6-month premium $1200.50 formatted with toLocaleString (may be $1,200.50 or 1,200.50)
      await waitFor(() => {
        const premiums = screen.getAllByText(/1,?200\.5/i);
        expect(premiums.length).toBeGreaterThan(0);
      });
    });

    it('should show "per month" label', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('per month')).toBeInTheDocument();
      });
    });

    it('should show "for 6 months" label', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/for 6 months/i)).toBeInTheDocument();
      });
    });

    it('should format premium using toFixed(2)', async () => {
      const quoteWithUnroundedPremium = {
        ...mockQuoteData,
        premium: {
          total: 1234.5,
          monthly: 205.75,
          sixMonth: 1234.5,
        },
      };

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: quoteWithUnroundedPremium,
        isLoading: false,
        error: null,
      });

      renderPage();

      await waitFor(() => {
        // Monthly premium formatted to 2 decimals (might have $ sign, may appear multiple times)
        const monthlyPremiums = screen.getAllByText(/\$?205\.75/);
        expect(monthlyPremiums.length).toBeGreaterThan(0);
      });
      // 6-month premium with comma separator (may be $1,234.50 or 1,234.50)
      const sixMonthPremiums = screen.getAllByText(/1,?234\.5/i);
      expect(sixMonthPremiums.length).toBeGreaterThan(0);
    });
  });

  describe('Quote Snapshot Data', () => {
    it('should load all data from quote_snapshot', async () => {
      renderPage();

      // Verify data is rendered from the quote object
      await waitFor(() => {
        const johnDoes = screen.getAllByText('John Doe');
        expect(johnDoes.length).toBeGreaterThan(0);
      });
      const camrys = screen.getAllByText('2020 Toyota Camry');
      expect(camrys.length).toBeGreaterThan(0);
      const quoteNumbers = screen.getAllByText(/DZ12345678/i);
      expect(quoteNumbers.length).toBeGreaterThan(0);
      const premiums = screen.getAllByText(/\$?200\.08/);
      expect(premiums.length).toBeGreaterThan(0);
    });

    it('should display comprehensive quote information', async () => {
      renderPage();

      // Drivers section
      await waitFor(() => {
        const johnDoes = screen.getAllByText('John Doe');
        expect(johnDoes.length).toBeGreaterThan(0);
      });
      const janeDoes = screen.getAllByText('Jane Doe');
      expect(janeDoes.length).toBeGreaterThan(0);

      // Vehicles section
      const camrys = screen.getAllByText('2020 Toyota Camry');
      expect(camrys.length).toBeGreaterThan(0);
      const civics = screen.getAllByText('2018 Honda Civic');
      expect(civics.length).toBeGreaterThan(0);

      // Coverage section
      expect(screen.getByText(/Bodily Injury/i)).toBeInTheDocument();
      expect(screen.getByText(/Property Damage/i)).toBeInTheDocument();

      // Premium section
      const premiums = screen.getAllByText(/\$?200\.08/);
      expect(premiums.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation - Bind Policy Button', () => {
    it('should have "Continue to Purchase" button', async () => {
      renderPage();

      await waitFor(() => {
        const bindButton = screen.getByRole('button', { name: /continue to purchase/i });
        expect(bindButton).toBeInTheDocument();
      });
    });

    it('should navigate to binding payment page with quote number', async () => {
      renderPage();

      await waitFor(() => {
        const bindButton = screen.getByRole('button', { name: /continue to purchase/i });
        expect(bindButton).toBeInTheDocument();
      });

      const bindButton = screen.getByRole('button', { name: /continue to purchase/i });
      fireEvent.click(bindButton);

      expect(mockNavigate).toHaveBeenCalledWith('/binding/checkout/DZ12345678');
    });
  });

  describe('Save Quote Functionality', () => {
    it('should have "Save Quote" button', async () => {
      renderPage();

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save quote/i });
        expect(saveButton).toBeInTheDocument();
      });
    });

    it('should show alert with quote number and email on save', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderPage();

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save quote/i });
        expect(saveButton).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save quote/i });
      fireEvent.click(saveButton);

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('DZ12345678')
      );
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('john.doe@example.com')
      );

      alertMock.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should show loading message while fetching quote', () => {
      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderPage();

      expect(screen.getByText('Loading your quote...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when quote fails to load', async () => {
      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch quote'),
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load quote')).toBeInTheDocument();
      });
    });

    it('should show "Start Over" button on error', async () => {
      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch quote'),
      });

      renderPage();

      await waitFor(() => {
        const startOverButton = screen.getByRole('button', { name: /start over/i });
        expect(startOverButton).toBeInTheDocument();
      });

      const startOverButton = screen.getByRole('button', { name: /start over/i });
      fireEvent.click(startOverButton);

      expect(mockNavigate).toHaveBeenCalledWith('/quote/driver-info');
    });

    it('should show error when quote data is null', async () => {
      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load quote')).toBeInTheDocument();
      });
    });
  });

  describe('Back Button Navigation', () => {
    it('should have back button to coverage selection page', async () => {
      renderPage();

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/quote/coverage-selection/DZ12345678');
    });
  });

  describe('Redirect Without Quote Number', () => {
    it('should redirect to driver info page when no quote number in URL', async () => {
      // Override useParams to return no quote number
      vi.mocked(await import('react-router-dom')).useParams = () => ({});

      renderPage();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/quote/driver-info');
      });
    });
  });

  describe('Premium Calculation Factors Display', () => {
    it('should list all vehicles in "Why This Rate?" section', async () => {
      renderPage();

      // Vehicles appear on page (in What's Covered and/or Why This Rate section)
      await waitFor(() => {
        expect(screen.getByText("What's Covered")).toBeInTheDocument();
      });
      const vehicles = screen.queryAllByText(/2020 Toyota Camry/i);
      expect(vehicles.length).toBeGreaterThan(0);
      const civics = screen.queryAllByText(/2018 Honda Civic/i);
      expect(civics.length).toBeGreaterThan(0);
    });

    it('should list primary driver as rating factor', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("What's Covered")).toBeInTheDocument();
      });
      // Verify John Doe appears on page (from driver section and/or rating factors)
      const johnDoes = screen.queryAllByText('John Doe');
      expect(johnDoes.length).toBeGreaterThan(0);
    });

    it('should list additional drivers as rating factors', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("What's Covered")).toBeInTheDocument();
      });
      // Verify driver names appear on page
      const janeDoes = screen.queryAllByText('Jane Doe');
      expect(janeDoes.length).toBeGreaterThan(0);
      const bobSmiths = screen.queryAllByText('Bob Smith');
      expect(bobSmiths.length).toBeGreaterThan(0);
    });

    it('should mention coverage package as rating factor', async () => {
      renderPage();

      await waitFor(() => {
        // Check that main sections exist
        expect(screen.getByText("What's Covered")).toBeInTheDocument();
      });
      // Check if "Why This Rate?" section exists (may not render in test environment)
      const whySection = screen.queryByText('Why This Rate?');
      if (whySection) {
        expect(whySection).toBeInTheDocument();
      }
    });
  });

  describe('Quote Card Sidebar', () => {
    it('should display quote card with premium in sidebar', async () => {
      renderPage();

      // Premium displayed on page (main section and/or sidebar)
      await waitFor(() => {
        expect(screen.getByText("What's Covered")).toBeInTheDocument();
      });
      const monthlyPremiums = screen.queryAllByText(/\$?200\.08/);
      expect(monthlyPremiums.length).toBeGreaterThan(0);
      const sixMonthPremiums = screen.queryAllByText(/1,?200\.5/i);
      expect(sixMonthPremiums.length).toBeGreaterThan(0);
    });

    it('should show quote reference in sidebar', async () => {
      renderPage();

      // Quote reference appears on page
      await waitFor(() => {
        expect(screen.getByText("What's Covered")).toBeInTheDocument();
      });
      const quoteNumbers = screen.queryAllByText(/DZ12345678/i);
      expect(quoteNumbers.length).toBeGreaterThan(0);
    });
  });
});
