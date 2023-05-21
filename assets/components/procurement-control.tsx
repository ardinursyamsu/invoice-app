import { formatter } from "assets/helper/helper";
import { useEffect, useState } from "react";

export default function ProcurementControl(props: any) {
  const { inventories } = props.data;

  const [inventory, setInventory] = useState(inventories[0].id);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [total, setTotal] = useState(price * quantity);

  const [data, setData] = useState({
    inventoryId: inventory,
    quantity: quantity,
    price: price,
    total: total,
  });

  // call the higher state if there's any update in data
  useEffect(() => {
    //console.log(data);
    // the final state is in the parent. Use callback in here to update value in the parent
    props.callback(props.id, data);
  }, [data]);

  const handleInventoryChange = (e: any) => {
    setInventory(e.target.value);
    setData((prevData) => ({ ...prevData, inventoryId: e.target.value }));
  };

  const handleQtyChange = (e: any) => {
    var currentQty = parseInt(e.target.value);
    //console.log(currentQty);
    if (currentQty < 0){
      currentQty = 0;
      console.log(currentQty)
    }
    setQuantity(!!currentQty ? currentQty : 0);
    setTotal(currentQty * price);
    setData((prevData) => ({
      ...prevData,
      quantity: currentQty,
      total: currentQty * price,
    }));
  };

  const handlePriceChange = (e: any) => {
    const currentPriceAsString: string = e.target.value;
    const currentPrice = parseInt(currentPriceAsString.replace(/[^\d.-]/g, ""));
    setPrice(currentPrice);
    setTotal(currentPrice * quantity);
    setData((prevData) => ({
      ...prevData,
      price: currentPrice,
      total: currentPrice * quantity,
    }));
  };

  return (
    <div className="row border rounded-2 mb-2">
      <div className="col-3 my-2">
        <select
          className="form-select"
          name="account"
          onChange={handleInventoryChange}
        >
          {inventories.map((inventory: typeof inventories) => (
            <option key={inventory.id} value={inventory.id}>
              {inventory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-2 my-2">
        <input
          type="number"
          className="form-control text-end"
          onChange={handleQtyChange}
          value={quantity}
        />
      </div>
      <div className="col-3 my-2">
        <input
          className="form-control text-end"
          name="price"
          onChange={handlePriceChange}
          value={formatter.format(price)}
          type="text"
        />
      </div>
      <div className="col-3 my-2">
        <input
          type="text"
          className="form-control text-end"
          value={formatter.format(total)}
          readOnly
        />
      </div>
      <div className="col-1 my-2">
        <button
          className="btn btn-outline-secondary d-none d-sm-none d-md-none d-lg-block"
          id={props.id}
          onClick={props.onDelete}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
}
