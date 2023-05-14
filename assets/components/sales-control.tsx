import { formatter } from "assets/helper/helper";

export default function SalesControl(props: any) {
  return (
    <div className="row border rounded-2 mb-2 py-2">
      <div className="col-4">
        <select className="form-select"></select>
      </div>
      
      <div className="col-1">
        <input
          name="quantity"
          className="form-control text-end"
          type="text"
          value={formatter.format(0)}
        />
      </div>
      <div className="col-3">
        <input
          name="price"
          className="form-control text-end"
          type="text"
          value={formatter.format(0)}
        />
      </div>
      <div className="col-3">
        <input
          name="total"
          className="form-control text-end"
          type="text"
          value={formatter.format(0)}
        />
      </div>
      <div className="col-1">
        <button
          id={props.id}
          onClick={props.onDelete}
          className="btn btn-outline-secondary d-none d-sm-none d-md-none d-lg-block"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
}
