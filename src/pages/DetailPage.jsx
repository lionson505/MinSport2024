import { usePagePermissions } from '../hooks/usePagePermissions';
import { MODULES } from '../utils/rbac';
import { PermissionButton } from '../components/PermissionButton';

function DetailPage() {
  const permissions = usePagePermissions(MODULES.YOUR_MODULE);

  return (
    <div>
      {/* View Content */}
      <div>{item.details}</div>

      {/* Action Buttons */}
      <div>
        <PermissionButton
          moduleName={MODULES.YOUR_MODULE}
          action="update"
          onClick={handleEdit}
          showTooltip
        >
          Edit
        </PermissionButton>
      </div>
    </div>
  );
}

export default DetailPage; 