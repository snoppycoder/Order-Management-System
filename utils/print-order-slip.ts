import { Order } from "@/components/order-view";
import { orderAPI } from "@/lib/api";

export async function printOrderSlip(order: Order) {
  const res = await orderAPI.getOrderDetail(order.name);
  const response = res.data;
  order.items = response.items;
  console.log("Printing order slip for order:", order);

  const html = `
    <html>
      <head>
        <title>Ruelux order slip</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          td, th { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h3>Order Slip</h3>
        <p><strong>Order:</strong> ${order.name}</p>
        <p><strong>Table:</strong> ${order.custom_table_number}</p>

        <table>
          <tr><th>Qty</th><th>Item</th><th>Price</th><th>Total</th></tr>
          ${order.items
            .map(
              (i) => `
              <tr>
                <td>${i.qty}</td>
                <td>${i.item_name}</td>
                <td>${i.price_list_rate}</td>
                <td>${i.qty * i.price_list_rate}</td>
              </tr>`
            )
            .join("")}
        </table>

        <h2>Customer Name: ${order.custom_customer_name || "N/A"}</h1>
        <h2>Served By: ${order.owner}</h1>

        <h3>Total: ${order.base_grand_total}</h3>

        <script>
          window.print();
          window.close();
        </script>
      </body>
    </html>
  `;

  // fetch(/api/printer) to send to a local printer server to silently print the slip
  //     await fetch("/api/printer", {
  //     method: "POST",
  //     headers: {
  //         "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ html }),
  //   }); // but it is not implemented yet
}
