import { formatter } from "assets/helper/helper";
import { useEffect, useState } from "react";

export default function SalesControl(props: any) {
  const { inventories } = props.data;

  

  const [inventory, setInventory] = useState(!!props.defaultData? props.defaultData.data.inventoryId : inventories[0].id);
  const [avgPrice, setAvgPrice] = useState(!!props.defaultData? props.defaultData.data.avgPrice : inventories[0].avg);
  const [quantity, setQuantity] = useState(!!props.defaultData? props.defaultData.data.quantity : 0);
  const [price, setPrice] = useState(!!props.defaultData? props.defaultData.data.price : 0);
  const [total, setTotal] = useState(price * quantity);

  const [data, setData] = useState({
    inventoryId: inventory,
    avgPrice: avgPrice,
    quantity: quantity,
    price: price,
  });

  // call the higher state if there's any update in data
  useEffect(() => {
    //console.log(data);
    // the final state is in the parent. Use callback in here to update value in the parent
    props.callback(props.id, data);
  }, [data]);

  const getAvgInventoryPrice = (inventoryId: string) => {
    const foundInventory = inventories.find(
      (inventory: any) => inventory.id === inventoryId
    );
    
    return foundInventory.avg;
  };

  const handleInventoryChange = (e: any) => {
    setInventory(e.target.value);
    setAvgPrice(getAvgInventoryPrice(e.target.value));
    setData((prevData) => ({
      ...prevData,
      inventoryId: e.target.value,
      avgPrice: getAvgInventoryPrice(e.target.value),
    }));
  };

  const handleQtyChange = (e: any) => {
    const currentQty = parseInt(e.target.value);
    setQuantity(!!currentQty ? currentQty : 0);
    setTotal(currentQty * price);
    setData((prevData) => ({ ...prevData, quantity: currentQty }));
  };

  const handlePriceChange = (e: any) => {
    var currentPriceAsString: string = e.target.value;
    if (!!currentPriceAsString == false) {
      currentPriceAsString = "0";
    }
    const currentPrice = parseInt(currentPriceAsString.replace(/[^\d.-]/g, ""));
    setPrice(currentPrice);
    setTotal(currentPrice * quantity);
    setData((prevData) => ({ ...prevData, price: currentPrice }));
  };

  return (
    <div className="row border rounded-2 mb-2 py-2">
      <div className="col-3">
        <select className="form-select" onChange={handleInventoryChange} defaultValue={inventory}>
          {inventories.map((inventory: typeof inventories) => (
            <option key={inventory.id} value={inventory.id}>
              {inventory.name}
            </option>
          ))}
        </select>
      </div>

      <div className="col-2">
        <input
          name="quantity"
          className="form-control text-end"
          type="number"
          value={formatter.format(quantity)}
          onChange={handleQtyChange}
        />
      </div>
      <div className="col-3">
        <input
          name="price"
          className="form-control text-end"
          type="text"
          value={formatter.format(price)}
          onChange={handlePriceChange}
        />
      </div>
      <div className="col-3">
        <input
          name="total"
          className="form-control text-end"
          type="text"
          value={formatter.format(total)}
          readOnly
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
