export default function Sidebar(props: any) {
  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <a
              href="/"
              className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 d-none d-sm-inline">Menu</span>
            </a>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="nav-item">
                <a href="/" className="nav-link align-middle px-0 text-white">
                  <i className="fs-4 bi-house"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Home</span>
                </a>
              </li>
              <li>
                <a
                  href="#submenu1"
                  data-bs-toggle="collapse"
                  className="nav-link px-0 align-middle"
                >
                  <i className="fs-4 bi-speedometer2"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Dashboard</span>{" "}
                </a>
              </li>
              <li>
                <a href="/receipt" className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-cash-coin"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Receipt</span>
                </a>
              </li>
              <li>
                <a href="/payment" className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-credit-card-fill"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Payment</span>
                </a>
              </li>
              <li>
                <a href="/transaction" className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-table"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Transactions</span>
                </a>
              </li>
              <li>
                <a
                  href="#submenu2"
                  data-bs-toggle="collapse"
                  className="nav-link px-0 align-middle"
                >
                  <i className="fs-4 bi-bootstrap"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Bootstrap</span>
                </a>
                <ul
                  className="collapse nav flex-column ms-1"
                  id="submenu2"
                  data-bs-parent="#menu"
                >
                  <li className="w-100">
                    <a href="#" className="nav-link px-0">
                      {" "}
                      <span className="d-none d-sm-inline">Item</span> 1
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link px-0">
                      {" "}
                      <span className="d-none d-sm-inline">Item</span> 2
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a
                  href="#submenu3"
                  data-bs-toggle="collapse"
                  className="nav-link px-0 align-middle"
                >
                  <i className="fs-4 bi-grid"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Products</span>{" "}
                </a>
                <ul
                  className="collapse nav flex-column ms-1"
                  id="submenu3"
                  data-bs-parent="#menu"
                >
                  <li className="w-100">
                    <a href="#" className="nav-link px-0">
                      {" "}
                      <span className="d-none d-sm-inline">Product</span> 1
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link px-0">
                      {" "}
                      <span className="d-none d-sm-inline">Product</span> 2
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link px-0">
                      {" "}
                      <span className="d-none d-sm-inline">Product</span> 3
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link px-0">
                      {" "}
                      <span className="d-none d-sm-inline">Product</span> 4
                    </a>
                  </li>
                </ul>
              </li>
              
              <li>
                <a href="/user" className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-people"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Users</span>{" "}
                </a>
              </li>
              <li>
                <a href="/account" className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-person-lines-fill"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Account</span>{" "}
                </a>
              </li>
              <a href="/sub-account" className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-person-vcard"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Sub-Account</span>{" "}
                </a>
              <li>
                <a href="/test" className="nav-link px-0 align-middle text-warning">
                  <i className="fs-4 bi bi-gear-fill"></i>{" "}
                  <span className="ms-1 d-none d-sm-inline">Test</span>{" "}
                </a>
              </li>
            </ul>
            <hr />
            
          </div>
        </div>
        <div className="col py-3">{props.children}</div>
      </div>
    </div>
  );
}
