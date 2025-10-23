/**
 * Portal Layout Component
 *
 * Shared layout for all portal pages with sidebar navigation.
 * Provides consistent header and navigation across the portal.
 */

import { Link } from 'react-router-dom';
import { Badge, Text } from '@sureapp/canary-design-system';
import { usePortalDashboard } from '../../hooks/usePortal';

interface PortalLayoutProps {
  children: React.ReactNode;
  policyNumber: string;
  activePage?: string;
}

export function PortalLayout({ children, policyNumber, activePage = 'overview' }: PortalLayoutProps) {
  const { data: dashboardData } = usePortalDashboard(policyNumber);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📄', path: `/portal/${policyNumber}` },
    { id: 'personal-info', label: 'Personal information', icon: '👤', path: `/portal/${policyNumber}/personal-info` },
    { id: 'vehicles', label: 'Property details', icon: '🏠', path: `/portal/${policyNumber}/vehicles` },
    { id: 'drivers', label: 'Additional insureds', icon: '👥', path: `/portal/${policyNumber}/drivers` },
    { id: 'coverage', label: 'Coverage', icon: '🛡️', path: `/portal/${policyNumber}/coverage` },
    { id: 'documents', label: 'Documents', icon: '📎', path: `/portal/${policyNumber}/documents` },
    { id: 'billing', label: 'Billing', icon: '💳', path: `/portal/${policyNumber}/billing` },
    { id: 'claims', label: 'Claims', icon: '📋', path: `/portal/${policyNumber}/claims` },
  ];

  const policy = dashboardData?.policy;
  const primaryDriver = dashboardData?.primary_driver;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>SURE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '500' }}>
              {primaryDriver?.firstName?.[0]?.toUpperCase() || 'M'}
            </div>
            <Text>
              {primaryDriver?.firstName || 'Molly'} {primaryDriver?.lastName || 'Brown'}
            </Text>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>Renters insurance</h1>
            <Badge color={policy?.status === 'IN_FORCE' || policy?.status === 'BOUND' ? 'success' : 'default'}>
              {policy?.status === 'IN_FORCE' ? 'ACTIVE' : policy?.status || 'BOUND'}
            </Badge>
          </div>
          <p style={{ color: '#6b7280', margin: 0 }}>Policy #{policy?.policy_number || policyNumber}</p>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {/* Sidebar Navigation */}
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    backgroundColor: activePage === item.id ? '#eff6ff' : 'white',
                    color: activePage === item.id ? '#2563eb' : '#374151',
                    borderLeft: activePage === item.id ? '4px solid #2563eb' : 'none',
                    fontWeight: activePage === item.id ? '500' : 'normal',
                  }}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
