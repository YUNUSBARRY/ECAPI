const getAllOrders = async (req, res) => {
  res.send("Get all orders")
}

const getSingleOrder = async (req, res) => {
  ress.send("Get single order")
}

const getCurrentUserOrders = async (req, res) => {
  res.send('Get current user orders')
}

const createOrder = async (req, res) => {
  res.send('Create Order')
}

const updateOrder = async (req, res) => {
  res.send("Update order")
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder
}