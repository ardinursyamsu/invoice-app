export default function AccountNavbar() {
    return (
      <div className="row bg-dark p-2 mb-4 mx-2 rounded-2">
          <a
          className="col nav-link px-0 align-middle text-warning text-center"
          href="/account"
        >
          Account
        </a>
        <a
          className="col nav-link px-0 align-middle text-warning text-center"
          href="/account/create"
        >
          Create Account
        </a>
      </div>
    );
  }
  