const { ObjectId } = require("mongodb");
const orderCollection = require("../model/collections/orders");
const productCProllection = require("../model/collections/products");
async function getOrderId(userId) {
  const getId = await orderCollection.findOne({ userId: new ObjectId(userId) });
  return getId._id;
}
async function getOrderProductByOrderId(orderId, productId) {
  try {
    // Find the order by its _id
    const order = await orderCollection.findOne({ _id: new ObjectId(orderId) });

    console.log(order + " this is the order ");
    // Find the product within the order by its _id
    const productInOrder = await order.products.find(
      (product) => product.productId.toString() === productId.toString()
    );
    console.log(productInOrder + "       product inorder");
    if (productInOrder) {
      return productInOrder;
    } else {
      return 0; // Product not found in order
    }
  } catch (error) {
    console.error("Error retrieving order product:", error);
    return 0; // Handle errors appropriately
  }
}
function getDeliveredOrders() {
  return new Promise(async (resolve, reject) => {
    try {
      const DeliveredOrders = await orderCollection.find({
        status: "Delivered",
      });

      const dayCount = Array(7).fill(0);
      const monthCount = Array(12).fill(0);
      DeliveredOrders.forEach((order) => {
        const deilveryDate = new Date(order.delverydate);
        const monthofYear = deilveryDate.getMonth();
        const dayOfWeek = deilveryDate.getDay();
        dayCount[dayOfWeek]++;
        monthCount[monthofYear]++;
      });
      // Function to get the day of the week
      const ordersbyDay = dayCount.map((count, dayOfweek) => ({
        day: getDayName(dayOfweek),
        count,
      }));
      const ordersByMonth = monthCount.map((count, monthofYear) => ({
        month: getMonthName(monthofYear),
        count,
      }));
      const salesByWeek = {};
      const salesByMonth = {};
      DeliveredOrders.forEach((order) => {
        const deliveryDate = new Date(order.delverydate);

        // Sales by Week
        const yearWeek = `${deliveryDate.getFullYear()}-${getWeekNumber(
          deliveryDate
        )}`;
        salesByWeek[yearWeek] = (salesByWeek[yearWeek] || 0) + 1;

        const yearMonth = `${deliveryDate.getFullYear()}-${
          deliveryDate.getMonth() + 1
        }`;
        salesByMonth[yearMonth] = (salesByMonth[yearMonth] || 0) + 1;
      });

      const ordersByWeek = Object.keys(salesByWeek).map((week) => ({
        week,
        count: salesByWeek[week],
      }));

      resolve({ ordersbyDay, ordersByWeek, ordersByMonth });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

function getDayName(dayOfweek) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayOfweek];
}

function getMonthName(month) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
}
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function sendConfirmationMail(userId){

}
module.exports = { getOrderId, getOrderProductByOrderId, getDeliveredOrders };
