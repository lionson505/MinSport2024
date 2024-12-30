import { usePagePermissions } from '../hooks/usePagePermissions';
import { MODULES } from '../utils/rbac';
import { PermissionButton } from '../components/PermissionButton';

function ListPage() {
  const permissions = usePagePermissions(MODULES.YOUR_MODULE);

  return (
    <div>
      {/* Add Button */}
      <PermissionButton
        moduleName={MODULES.YOUR_MODULE}
        action="create"
        onClick={handleAdd}
        showTooltip
      >
        Add New
      </PermissionButton>

      {/* Table Actions */}
      <table>
        {items.map(item => (
          <tr>
            <td>
              <PermissionButton
                moduleName={MODULES.YOUR_MODULE}
                action="update"
                onClick={() => handleEdit(item)}
                showTooltip
              >
                Edit
              </PermissionButton>
              <PermissionButton
                moduleName={MODULES.YOUR_MODULE}
                action="delete"
                onClick={() => handleDelete(item)}
                showTooltip
              >
                Delete
              </PermissionButton>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default ListPage; 