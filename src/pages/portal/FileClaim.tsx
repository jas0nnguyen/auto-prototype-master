/**
 * File Claim Page
 *
 * Allows policyholders to file a new insurance claim with incident details
 * and document uploads.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Text, Button } from '@sureapp/canary-design-system';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { DocumentUpload } from '../../components/insurance/DocumentUpload';
import { usePortalDashboard, useFileClaim } from '../../hooks/usePortal';

export default function FileClaim() {
  const { policyNumber } = useParams<{ policyNumber: string }>();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = usePortalDashboard(policyNumber!);
  const fileClaimMutation = useFileClaim();

  const [formData, setFormData] = useState({
    incident_date: '',
    loss_type: '',
    vehicle_identifier: '',
    driver_identifier: '',
    description: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading || error || !dashboardData) {
    return (
      <PortalLayout policyNumber={policyNumber!} activePage="claims">
        Loading...
      </PortalLayout>
    );
  }

  const { vehicles, primary_driver, additional_drivers } = dashboardData;

  // Combine all drivers
  const allDrivers = [
    { id: primary_driver.driver_id, name: `${primary_driver.firstName} ${primary_driver.lastName}` },
    ...(additional_drivers || []).map((driver: any) => ({
      id: driver.driver_id,
      name: `${driver.firstName} ${driver.lastName}`,
    })),
  ];

  const lossTypes = [
    { value: 'COLLISION', label: 'Collision' },
    { value: 'COMPREHENSIVE', label: 'Comprehensive' },
    { value: 'LIABILITY', label: 'Liability' },
    { value: 'THEFT', label: 'Theft' },
    { value: 'VANDALISM', label: 'Vandalism' },
    { value: 'WEATHER_DAMAGE', label: 'Weather Damage' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!formData.incident_date) {
      setSubmitError('Incident date is required');
      return;
    }
    if (!formData.loss_type) {
      setSubmitError('Loss type is required');
      return;
    }
    if (!formData.description.trim()) {
      setSubmitError('Description is required');
      return;
    }

    try {
      const result = await fileClaimMutation.mutateAsync({
        policyNumber: policyNumber!,
        claimData: {
          incident_date: formData.incident_date,
          loss_type: formData.loss_type,
          description: formData.description,
          vehicle_identifier: formData.vehicle_identifier || undefined,
          driver_identifier: formData.driver_identifier || undefined,
        },
      });

      // Show success message with claim number
      alert(`Claim filed successfully! Claim Number: ${result.claim_number || result.claim_id}`);

      // Navigate to claims list
      navigate(`/portal/${policyNumber}/claims`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to file claim');
    }
  };

  return (
    <PortalLayout policyNumber={policyNumber!} activePage="claims">
      <h2 className="text-2xl font-bold mb-6">
        File a Claim
      </h2>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Incident Date */}
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Incident Date *</Text>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.incident_date}
                onChange={(e) => handleInputChange('incident_date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Loss Type */}
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Loss Type *</Text>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.loss_type}
                onChange={(e) => handleInputChange('loss_type', e.target.value)}
                required
              >
                <option value="">Select loss type</option>
                {lossTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Involved */}
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Which vehicle was involved? (Optional)</Text>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.vehicle_identifier}
                onChange={(e) => handleInputChange('vehicle_identifier', e.target.value)}
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle: any) => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver Involved */}
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Which driver was involved? (Optional)</Text>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.driver_identifier}
                onChange={(e) => handleInputChange('driver_identifier', e.target.value)}
              >
                <option value="">Select driver</option>
                {allDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Description *</Text>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please describe what happened in detail..."
                rows={6}
                required
              />
              <Text color="muted" size="sm" className="mt-1">
                Include details about the incident, damages, and any other relevant information.
              </Text>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block mb-2">
                <Text className="font-medium">Upload Photos/Documents (Optional)</Text>
              </label>
              <DocumentUpload onFilesChange={setUploadedFiles} maxFiles={5} maxSizePerFile={10} />
              <Text color="muted" size="sm" className="mt-2">
                Upload photos of the damage, police reports, or other relevant documents.
              </Text>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text color="error">{submitError}</Text>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={fileClaimMutation.isPending}
                className="flex-1"
              >
                {fileClaimMutation.isPending ? 'Filing Claim...' : 'Submit Claim'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/portal/${policyNumber}/claims`)}
                disabled={fileClaimMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Information Card */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h2 level={3} size="sm" className="mb-2">
          What happens next?
        </h2>
        <ul className="space-y-2">
          <li>
            <Text size="sm">• You'll receive a claim number once your claim is submitted</Text>
          </li>
          <li>
            <Text size="sm">• A claims adjuster will be assigned within 24-48 hours</Text>
          </li>
          <li>
            <Text size="sm">• You can track your claim status in the Claims section</Text>
          </li>
          <li>
            <Text size="sm">• You may be contacted for additional information or documentation</Text>
          </li>
        </ul>
      </Card>
    </PortalLayout>
  );
}
