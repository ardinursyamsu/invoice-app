export default function TransactionNavbar() {
    return (
      <div className="row bg-dark p-2 mb-4 mx-2 rounded-2">
          <a
          className="col nav-link px-0 align-middle text-warning text-center"
          href="/transaction"
        >
          Transaction
        </a>
        <a
          className="col nav-link px-0 align-middle text-warning text-center"
          href="/transaction/create"
        >
          Create Transaction
        </a>
      </div>
    );
  }