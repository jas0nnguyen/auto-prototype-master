import { EditVehicleModal } from './EditVehicleModal';

/**
 * EditVehicleFinancedModal
 *
 * Extends EditVehicleModal with additional lienholder fields for FINANCED/LEASED vehicles.
 * This component is a placeholder for future enhancement - currently reuses base EditVehicleModal.
 *
 * Additional fields (shown when ownership_status is FINANCED or LEASED):
 * - lienholder_name
 * - lienholder_address (line_1, line_2)
 * - lienholder municipality/state
 */

// Re-export EditVehicleModal for now
// In T083 full implementation, this would add lienholder fields conditionally
export { EditVehicleModal as EditVehicleFinancedModal };
