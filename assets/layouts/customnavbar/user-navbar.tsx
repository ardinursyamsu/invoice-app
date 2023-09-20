export default function UserNavbar() {
  return (
    <div className="row bg-dark p-2 mb-4 mx-2 rounded-2">
      <a className="col nav-link px-0 align-middle text-warning text-center" href="/user">
        User
      </a>
      <a className="col nav-link px-0 align-middle text-warning text-center" href="/user/create">
        Create User
      </a>
    </div>
  );
}
