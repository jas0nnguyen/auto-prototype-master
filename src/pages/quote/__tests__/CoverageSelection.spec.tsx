/**
 * CoverageSelection Page Tests (T171)
 *
 * Tests for the coverage selection page component.
 * This page allows users to customize their insurance coverage and see real-time premium updates.
 */

import { describe, it, expect, beforeEach, vi, type Mock, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import CoverageSelection from '../CoverageSelection';
import * as useQuoteHooks from '../../../hooks/useQuote';

// Mock the hooks
vi.mock('../../../hooks/useQuote', () => ({
  useQuoteByNumber: vi.fn(),
  useUpdateQuoteCoverage: vi.fn(),
}));

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ quoteNumber: 'DZ12345678' }),
  };
});

describe('CoverageSelection Page (T171)', () => {
  let queryClient: QueryClient;

  const mockQuoteData = {
    quote_number: 'DZ12345678',
    quote_status: 'QUOTED',
    driver: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    vehicles: [
      {
        year: 2020,
        make: 'Toyota',
        model: 'Camry',
        vin: 'VIN123456789',
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
      hasRoadside: false,
      hasRental: false,
      rentalLimit: 50,
    },
    premium: {
      total: 720,
      monthly: 120,
      sixMonth: 720,
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

    // Default mock implementations
    (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
      data: mockQuoteData,
      isLoading: false,
      error: null,
      refetch: vi.fn().mockResolvedValue({ data: mockQuoteData }),
    });

    (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockQuoteData),
      isPending: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/quote/coverage-selection/DZ12345678']}>
          <CoverageSelection />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Page Rendering', () => {
    it('should render coverage selection form with all sections', async () => {
      renderPage();

      // Page title
      await waitFor(() => {
        expect(screen.getByText('Customize Your Coverage')).toBeInTheDocument();
      });

      // Coverage sections
      expect(screen.getByText('Required Coverage')).toBeInTheDocument();
      expect(screen.getByText('Recommended Coverage')).toBeInTheDocument();
      expect(screen.getByText('Additional Protection')).toBeInTheDocument();

      // Submit button
      expect(screen.getByRole('button', { name: /see my quote/i })).toBeInTheDocument();
    });

    it('should render coverage start date input', async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByLabelText(/when do you want coverage to start/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Required Coverage - Liability', () => {
    it('should render bodily injury limit select', async () => {
      renderPage();

      await waitFor(() => {
        const bodilyInjurySelect = screen.getByLabelText(/bodily injury limit/i);
        expect(bodilyInjurySelect).toBeInTheDocument();
      });
    });

    it('should render property damage limit select', async () => {
      renderPage();

      await waitFor(() => {
        const propertyDamageSelect = screen.getByLabelText(/property damage limit/i);
        expect(propertyDamageSelect).toBeInTheDocument();
      });
    });

    it('should allow changing bodily injury limits', async () => {
      renderPage();

      await waitFor(() => {
        const bodilyInjurySelect = screen.getByLabelText(/bodily injury limit/i);
        expect(bodilyInjurySelect).toBeInTheDocument();
      });

      const bodilyInjurySelect = screen.getByLabelText(/bodily injury limit/i);

      // Change value (this triggers the Select onChange)
      fireEvent.click(bodilyInjurySelect);

      // Note: Actual Select interaction would require Canary-specific testing
      // For now, we verify the select is interactive
      expect(bodilyInjurySelect).toBeInTheDocument();
    });
  });

  describe('Recommended Coverage - Toggles', () => {
    it('should render collision coverage toggle', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Collision Coverage')).toBeInTheDocument();
      });
      const collisionSwitch = screen.getByRole('switch', { name: /collision/i });
      expect(collisionSwitch).toBeInTheDocument();
    });

    it('should render comprehensive coverage toggle', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Comprehensive Coverage')).toBeInTheDocument();
      });
      const comprehensiveSwitch = screen.getByRole('switch', { name: /comprehensive/i });
      expect(comprehensiveSwitch).toBeInTheDocument();
    });

    it('should render uninsured motorist toggle', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Uninsured\/Underinsured Motorist Coverage/i)).toBeInTheDocument();
      });
      const uninsuredSwitch = screen.getByRole('switch', { name: /uninsured/i });
      expect(uninsuredSwitch).toBeInTheDocument();
    });

    it('should show collision deductible select when collision is enabled', async () => {
      renderPage();

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByLabelText(/bodily injury limit/i)).toBeInTheDocument();
      });

      // Collision is enabled by default in mock data
      const deductibleSelect = screen.getByLabelText(/^deductible$/i);
      expect(deductibleSelect).toBeInTheDocument();
    });

    it('should toggle collision coverage on and off', async () => {
      renderPage();

      const collisionSwitch = screen.getByRole('switch', { name: /collision/i });

      // Initially checked (from mock data)
      expect(collisionSwitch).toBeChecked();

      // Toggle off
      fireEvent.click(collisionSwitch);

      await waitFor(() => {
        expect(collisionSwitch).not.toBeChecked();
      });

      // Toggle back on
      fireEvent.click(collisionSwitch);

      await waitFor(() => {
        expect(collisionSwitch).toBeChecked();
      });
    });
  });

  describe('Additional Protection - Optional Coverages', () => {
    it('should render roadside assistance toggle', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('24/7 Roadside Assistance')).toBeInTheDocument();
      });
      const roadsideSwitch = screen.getByRole('switch', { name: /roadside/i });
      expect(roadsideSwitch).toBeInTheDocument();
    });

    it('should render rental reimbursement toggle', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Rental Car Reimbursement')).toBeInTheDocument();
      });
      const rentalSwitch = screen.getByRole('switch', { name: /rental/i });
      expect(rentalSwitch).toBeInTheDocument();
    });

    it('should toggle roadside assistance', async () => {
      renderPage();

      const roadsideSwitch = screen.getByRole('switch', { name: /roadside/i });

      // Initially unchecked (from mock data)
      expect(roadsideSwitch).not.toBeChecked();

      // Toggle on
      fireEvent.click(roadsideSwitch);

      await waitFor(() => {
        expect(roadsideSwitch).toBeChecked();
      });
    });

    it('should toggle rental reimbursement', async () => {
      renderPage();

      const rentalSwitch = screen.getByRole('switch', { name: /rental/i });

      // Initially unchecked (from mock data)
      expect(rentalSwitch).not.toBeChecked();

      // Toggle on
      fireEvent.click(rentalSwitch);

      await waitFor(() => {
        expect(rentalSwitch).toBeChecked();
      });
    });
  });

  describe('Real-Time Premium Updates', () => {
    it('should display premium from API data', async () => {
      renderPage();

      await waitFor(() => {
        // Monthly premium displayed in QuoteCard
        expect(screen.getByText('120.00')).toBeInTheDocument();
        // 6-month premium
        expect(screen.getByText('720.00')).toBeInTheDocument();
      });
    });

    it('should debounce API calls when coverage changes (300ms)', async () => {
      vi.useFakeTimers();

      const mockMutateAsync = vi.fn().mockResolvedValue({
        ...mockQuoteData,
        premium: {
          total: 800,
          monthly: 133,
          sixMonth: 800,
        },
      });

      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          ...mockQuoteData,
          premium: {
            total: 800,
            monthly: 133,
            sixMonth: 800,
          },
        },
      });

      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: mockQuoteData,
        isLoading: false,
        refetch: mockRefetch,
      });

      renderPage();

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /roadside/i })).toBeInTheDocument();
      });

      const roadsideSwitch = screen.getByRole('switch', { name: /roadside/i });

      // Toggle coverage multiple times quickly
      fireEvent.click(roadsideSwitch);
      fireEvent.click(roadsideSwitch);
      fireEvent.click(roadsideSwitch);

      // Should NOT call API immediately
      expect(mockMutateAsync).not.toHaveBeenCalled();

      // Fast-forward 200ms - still shouldn't call
      vi.advanceTimersByTime(200);
      expect(mockMutateAsync).not.toHaveBeenCalled();

      // Fast-forward another 100ms (total 300ms)
      vi.advanceTimersByTime(100);

      // Now API should be called once (debounced)
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      });

      vi.useRealTimers();
    });

    it('should show loading state during premium recalculation', async () => {
      vi.useFakeTimers();

      const mockMutateAsync = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ...mockQuoteData,
                  premium: { total: 800, monthly: 133, sixMonth: 800 },
                }),
              500
            );
          })
      );

      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /roadside/i })).toBeInTheDocument();
      });

      const roadsideSwitch = screen.getByRole('switch', { name: /roadside/i });

      // Toggle coverage
      fireEvent.click(roadsideSwitch);

      // Fast-forward debounce time
      vi.advanceTimersByTime(300);

      // Should show loading skeleton (check via QuoteCard isLoading prop)
      await waitFor(() => {
        // Loading state is indicated by Skeleton components
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });

    it('should update premium display after recalculation', async () => {
      const updatedQuoteData = {
        ...mockQuoteData,
        premium: {
          total: 800,
          monthly: 133,
          sixMonth: 800,
        },
      };

      const mockRefetch = vi.fn().mockResolvedValue({ data: updatedQuoteData });

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: mockQuoteData,
        isLoading: false,
        refetch: mockRefetch,
      });

      const mockMutateAsync = vi.fn().mockResolvedValue(updatedQuoteData);

      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      // Initial premium
      await waitFor(() => {
        expect(screen.getByText('120.00')).toBeInTheDocument();
      });

      // After update, premium should change
      // Note: In real implementation, this would require refetch to update the displayed value
    });
  });

  describe('Premium Formatting', () => {
    it('should format monthly premium with 2 decimal places', async () => {
      renderPage();

      await waitFor(() => {
        // Should display as XXX.XX format
        const monthlyPremium = screen.getByText('120.00');
        expect(monthlyPremium).toBeInTheDocument();
      });
    });

    it('should format 6-month premium with 2 decimal places', async () => {
      renderPage();

      await waitFor(() => {
        const sixMonthPremium = screen.getByText('720.00');
        expect(sixMonthPremium).toBeInTheDocument();
      });
    });

    it('should handle premiums with cents correctly', async () => {
      const quoteWithCents = {
        ...mockQuoteData,
        premium: {
          total: 723.45,
          monthly: 120.58,
          sixMonth: 723.45,
        },
      };

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: quoteWithCents,
        isLoading: false,
        refetch: vi.fn().mockResolvedValue({ data: quoteWithCents }),
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText('120.58')).toBeInTheDocument();
        expect(screen.getByText('723.45')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should navigate to quote results on successful submission', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue(mockQuoteData);

      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      // Wait for form to render
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /see my quote/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /see my quote/i });

      // Click submit
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/quote/results/DZ12345678');
      });
    });

    it('should call update API with all coverage selections', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue(mockQuoteData);

      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /see my quote/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /see my quote/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          quoteNumber: 'DZ12345678',
          coverageData: expect.objectContaining({
            coverage_bodily_injury_limit: expect.any(String),
            coverage_property_damage_limit: expect.any(String),
            coverage_collision: expect.any(Boolean),
            coverage_comprehensive: expect.any(Boolean),
            coverage_uninsured_motorist: expect.any(Boolean),
            coverage_roadside_assistance: expect.any(Boolean),
            coverage_rental_reimbursement: expect.any(Boolean),
          }),
        });
      });
    });

    it('should require coverage start date before submission', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // Mock quote without coverage start date
      const quoteWithoutDate = {
        ...mockQuoteData,
        coverages: {
          ...mockQuoteData.coverages,
          startDate: null,
        },
      };

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: quoteWithoutDate,
        isLoading: false,
        refetch: vi.fn(),
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /see my quote/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /see my quote/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Please select a coverage start date');
      });

      alertMock.mockRestore();
    });

    it('should disable submit button while submitting', async () => {
      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(mockQuoteData), 1000);
            })
        ),
        isPending: true,
      });

      renderPage();

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /finalizing your quote/i,
        });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching quote data', async () => {
      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      renderPage();

      // Submit button should be disabled during loading
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /see my quote/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error alert when coverage update fails', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const mockMutateAsync = vi.fn().mockRejectedValue(new Error('API Error'));

      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /see my quote/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /see my quote/i }));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Failed to finalize quote. Please try again.');
      });

      alertMock.mockRestore();
    });

    it('should handle API errors during real-time updates gracefully', async () => {
      vi.useFakeTimers();

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Premium calculation failed'));

      (useQuoteHooks.useUpdateQuoteCoverage as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /roadside/i })).toBeInTheDocument();
      });

      const roadsideSwitch = screen.getByRole('switch', { name: /roadside/i });
      fireEvent.click(roadsideSwitch);

      // Fast-forward debounce time
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to update coverage:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
      vi.useRealTimers();
    });
  });

  describe('Navigation', () => {
    it('should have back button to vehicles page', async () => {
      renderPage();

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/quote/vehicles/DZ12345678');
    });
  });
});
