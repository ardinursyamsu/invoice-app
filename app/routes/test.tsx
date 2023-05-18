import { json } from "@remix-run/node";
import Body from "assets/layouts/body";
import { getAllTransaction } from "~/models/transaction.server";

export const loader = async () => {
  const transactions = await getAllTransaction();

  console.log(transactions);

  return json({transactions})
}

export default function User() {
  return <Body>This is a testing page</Body>;
}
