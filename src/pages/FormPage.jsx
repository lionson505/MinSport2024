import { usePagePermissions } from '../hooks/usePagePermissions';
import { MODULES } from '../utils/rbac';
import { PermissionButton } from '../components/PermissionButton';

function FormPage() {
  const permissions = usePagePermissions(MODULES.YOUR_MODULE);
  
  // Check if user can edit
  const canEdit = permissions.canUpdate;
  
  return (
    <form>
      <input disabled={!canEdit} />
      
      <PermissionButton
        moduleName={MODULES.YOUR_MODULE}
        action="update"
        type="submit"
        showTooltip
      >
        Save
      </PermissionButton>
    </form>
  );
}

export default FormPage; 