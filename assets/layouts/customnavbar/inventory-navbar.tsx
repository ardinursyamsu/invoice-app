export default function InventoryNavbar() {
  return (
    <div className="row bg-dark p-2 mb-4 mx-2 rounded-2">
        <a
        className="col nav-link px-0 align-middle text-warning text-center"
        href="/inventory"
      >
        Home
      </a>
      <a
        className="col nav-link px-0 align-middle text-warning text-center"
        href="/inventory/create"
      >
        Create Inventory
      </a>
      <a
        className="col nav-link px-0 align-middle text-warning text-center"
        href="/inventory/procure"
      >
        Procure Inventory
      </a>
      <a
        className="col nav-link px-0 align-middle text-warning text-center"
        href="/inventory/writeoff"
      >
        Write-off Inventory
      </a>
    </div>
  );
}
