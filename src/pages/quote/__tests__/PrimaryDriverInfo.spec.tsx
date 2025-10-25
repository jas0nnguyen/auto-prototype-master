/**
 * PrimaryDriverInfo Page Tests (T168)
 *
 * Tests for the primary driver information page component.
 * This page is the first step in the quote flow and creates a new quote.
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import PrimaryDriverInfo from '../PrimaryDriverInfo';
import * as useQuoteHooks from '../../../hooks/useQuote';

// Mock the hooks
vi.mock('../../../hooks/useQuote', () => ({
  useCreateQuote: vi.fn(),
  useQuoteByNumber: vi.fn(),
  useUpdatePrimaryDriver: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

describe('PrimaryDriverInfo Page (T168)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    (useQuoteHooks.useUpdatePrimaryDriver as Mock).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });
  });

  const renderPage = (initialRoute = '/quote/driver-info') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <PrimaryDriverInfo />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Form Rendering', () => {
    it('should render form with all required fields', () => {
      renderPage();

      // Personal Information Section
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      // Select components don't use traditional labels, check by text instead
      expect(screen.getByText(/gender/i)).toBeInTheDocument();
      expect(screen.getByText(/marital status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();

      // Address Section
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apartment, suite/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      // State is a Select, check by text
      expect(screen.getByText(/state/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();

      // Submit Button
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should render page header and title', () => {
      renderPage();

      expect(screen.getByText('About You')).toBeInTheDocument();
      expect(
        screen.getByText(/we need some information about you to calculate your personalized rate/i)
      ).toBeInTheDocument();
    });

    it('should have phone field marked as optional', () => {
      renderPage();

      const phoneLabel = screen.getByLabelText(/phone number/i);
      expect(phoneLabel).toBeInTheDocument();
      expect(screen.getByText(/phone number \(optional\)/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission - New Quote', () => {
    it('should create quote with DZXXXXXXXX ID on form submission with valid data', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        quoteNumber: 'DZ12345678',
        quoteId: 'quote-uuid-123',
      });

      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      // Fill out form
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '01/15/1990' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/street address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Los Angeles' },
      });
      fireEvent.change(screen.getByLabelText(/zip code/i), {
        target: { value: '90001' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            driver_first_name: 'John',
            driver_last_name: 'Doe',
            driver_birth_date: '01/15/1990',
            driver_email: 'john.doe@example.com',
            address_line_1: '123 Main St',
            address_city: 'Los Angeles',
            address_zip: '90001',
          })
        );
      });

      // Should navigate to additional drivers page with quote number
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/quote/additional-drivers/DZ12345678');
      });
    });

    it('should include optional phone number when provided', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        quoteNumber: 'DZ12345678',
      });

      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '01/15/1990' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/phone number/i), {
        target: { value: '(555) 123-4567' },
      });
      fireEvent.change(screen.getByLabelText(/street address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Los Angeles' },
      });
      fireEvent.change(screen.getByLabelText(/zip code/i), {
        target: { value: '90001' },
      });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            driver_phone: '(555) 123-4567',
          })
        );
      });
    });
  });

  describe('Email Validation', () => {
    it('should reject invalid email addresses', async () => {
      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderPage();

      // Fill form with invalid email
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      });
      fireEvent.change(screen.getByLabelText(/street address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Los Angeles' },
      });
      fireEvent.change(screen.getByLabelText(/zip code/i), {
        target: { value: '90001' },
      });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Please enter a valid email address');
      });

      alertMock.mockRestore();
    });

    it('should accept valid email addresses', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        quoteNumber: 'DZ12345678',
      });

      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      const validEmails = [
        'john.doe@example.com',
        'jane+test@company.co.uk',
        'user_123@domain.org',
      ];

      for (const email of validEmails) {
        vi.clearAllMocks();

        fireEvent.change(screen.getByLabelText(/first name/i), {
          target: { value: 'John' },
        });
        fireEvent.change(screen.getByLabelText(/last name/i), {
          target: { value: 'Doe' },
        });
        fireEvent.change(screen.getByLabelText(/date of birth/i), {
          target: { value: '01/15/1990' },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: email },
        });
        fireEvent.change(screen.getByLabelText(/street address/i), {
          target: { value: '123 Main St' },
        });
        fireEvent.change(screen.getByLabelText(/city/i), {
          target: { value: 'Los Angeles' },
        });
        fireEvent.change(screen.getByLabelText(/zip code/i), {
          target: { value: '90001' },
        });

        fireEvent.click(screen.getByRole('button', { name: /continue/i }));

        await waitFor(() => {
          expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
              driver_email: email,
            })
          );
        });
      }
    });
  });

  describe('ZIP Code Validation', () => {
    it('should reject invalid ZIP codes', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      renderPage();

      // Fill form with invalid ZIP
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/street address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Los Angeles' },
      });
      fireEvent.change(screen.getByLabelText(/zip code/i), {
        target: { value: '123' }, // Invalid: too short
      });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Please enter a valid 5-digit ZIP code');
      });

      alertMock.mockRestore();
    });

    it('should accept valid 5-digit ZIP codes', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        quoteNumber: 'DZ12345678',
      });

      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '01/15/1990' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/street address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Los Angeles' },
      });
      fireEvent.change(screen.getByLabelText(/zip code/i), {
        target: { value: '90001' },
      });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            address_zip: '90001',
          })
        );
      });
    });
  });

  describe('Data Pre-population (Navigating Back)', () => {
    it('should load existing quote data when quote number is in URL', async () => {
      const mockQuoteData = {
        quote_number: 'DZ12345678',
        driver: {
          firstName: 'Jane',
          lastName: 'Smith',
          birthDate: '03/20/1985',
          gender: 'female',
          maritalStatus: 'married',
          email: 'jane.smith@example.com',
          phone: '(555) 987-6543',
        },
        address: {
          addressLine1: '456 Oak Ave',
          addressLine2: 'Apt 2B',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
      };

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: mockQuoteData,
        isLoading: false,
        error: null,
      });

      // Mock useParams to return quote number
      vi.mocked(await import('react-router-dom')).useParams = () => ({
        quoteNumber: 'DZ12345678',
      });

      renderPage('/quote/driver-info/DZ12345678');

      // Wait for data to load and form to populate
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('Smith');
        expect(screen.getByLabelText(/email/i)).toHaveValue('jane.smith@example.com');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('(555) 987-6543');
        expect(screen.getByLabelText(/street address/i)).toHaveValue('456 Oak Ave');
        expect(screen.getByLabelText(/apartment, suite/i)).toHaveValue('Apt 2B');
        expect(screen.getByLabelText(/city/i)).toHaveValue('San Francisco');
        expect(screen.getByLabelText(/zip code/i)).toHaveValue('94102');
      });
    });
  });

  describe('Email Change Detection', () => {
    it('should create new quote when email changes', async () => {
      const mockQuoteData = {
        quote_number: 'DZ12345678',
        driver: {
          firstName: 'Jane',
          lastName: 'Smith',
          birthDate: '03/20/1985',
          gender: 'female',
          maritalStatus: 'married',
          email: 'jane.smith@example.com',
          phone: '(555) 987-6543',
        },
        address: {
          addressLine1: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
      };

      const mockCreateMutateAsync = vi.fn().mockResolvedValue({
        quoteNumber: 'DZ99999999', // New quote number
      });

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: mockQuoteData,
        isLoading: false,
      });

      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: mockCreateMutateAsync,
        isPending: false,
      });

      // Mock useParams
      vi.mocked(await import('react-router-dom')).useParams = () => ({
        quoteNumber: 'DZ12345678',
      });

      renderPage('/quote/driver-info/DZ12345678');

      // Wait for form to populate
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toHaveValue('jane.smith@example.com');
      });

      // Change email to a different one
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new.email@example.com' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Should create NEW quote because email changed
      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            driver_email: 'new.email@example.com',
          })
        );
      });

      // Should navigate to new quote number
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/quote/additional-drivers/DZ99999999');
      });
    });

    it('should update existing quote when email unchanged but other fields changed', async () => {
      const mockQuoteData = {
        quote_number: 'DZ12345678',
        driver: {
          firstName: 'Jane',
          lastName: 'Smith',
          birthDate: '03/20/1985',
          gender: 'female',
          maritalStatus: 'married',
          email: 'jane.smith@example.com',
          phone: '(555) 987-6543',
        },
        address: {
          addressLine1: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
      };

      const mockUpdateMutateAsync = vi.fn().mockResolvedValue({
        quoteNumber: 'DZ12345678',
      });

      (useQuoteHooks.useQuoteByNumber as Mock).mockReturnValue({
        data: mockQuoteData,
        isLoading: false,
      });

      (useQuoteHooks.useUpdatePrimaryDriver as Mock).mockReturnValue({
        mutateAsync: mockUpdateMutateAsync,
        isPending: false,
      });

      // Mock useParams
      vi.mocked(await import('react-router-dom')).useParams = () => ({
        quoteNumber: 'DZ12345678',
      });

      renderPage('/quote/driver-info/DZ12345678');

      // Wait for form to populate
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
      });

      // Change first name but keep email the same
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Janet' },
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Should UPDATE existing quote
      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
          quoteNumber: 'DZ12345678',
          driverData: expect.objectContaining({
            driver_first_name: 'Janet',
            driver_email: 'jane.smith@example.com', // Same email
          }),
        });
      });

      // Should navigate with same quote number
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/quote/additional-drivers/DZ12345678');
      });
    });
  });

  describe('Loading States', () => {
    it('should disable submit button while creating quote', () => {
      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true, // Loading state
      });

      renderPage();

      const submitButton = screen.getByRole('button', { name: /creating quote/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Creating quote...');
    });

    it('should show normal state when not loading', () => {
      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
      });

      renderPage();

      const submitButton = screen.getByRole('button', { name: /continue/i });
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Continue');
    });
  });

  describe('Error Handling', () => {
    it('should show error alert when quote creation fails', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      const mockMutateAsync = vi.fn().mockRejectedValue(new Error('API Error'));

      (useQuoteHooks.useCreateQuote as Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      renderPage();

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '01/15/1990' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john.doe@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/street address/i), {
        target: { value: '123 Main St' },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Los Angeles' },
      });
      fireEvent.change(screen.getByLabelText(/zip code/i), {
        target: { value: '90001' },
      });

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          'Failed to save driver information. Please try again.'
        );
      });

      alertMock.mockRestore();
    });
  });
});
