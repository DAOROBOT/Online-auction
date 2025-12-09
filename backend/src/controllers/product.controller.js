import orderService from '../services/order.db.js';

const controller = {
  listOrder: function (req, res, next) {
    orderService.findAll().then((orders) => {
      res.json(orders);
    }).catch(next);
  },

  getOrder: function (req, res, next) {
    const id = Number(req.params.id);
    orderService.findById(id).then((order) => {
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({
          message: 'Order not found',
        });
      }
    }).catch(next);
  },

  createOrder: function (req, res) {
    orderService.create(req.body).then((order) => {
      res.status(201).json(order);
    });
  },

  updateOrder: function(req, res, next) {
    const id = Number(req.params.id);
    const { body } = req;
    orderService.findById(id).then(async (order) => {
      if (!order) {
        res.status(404).json({
          message: 'Order not found',
        });
      } else {
        order.recipient = body.recipient;
        order.houseNumber = order.houseNumber;
        order.street = body.street;
        order.wardId = body.wardId;
        order.provinceId = body.provinceId;
        const result = await orderService.update(order);
        res.json(result);
      }
    }).catch(next);
  },

  removeOrder: function (req, res) {
    const id = Number(req.params.id);
    const order = orderService.findById(id);
    if (!order) {
      res.status(404).json({
        message: 'Order not found',
      });
    } else {
      orderService.removeById(id);
      res.json({});
    }
  }
}

export default controller;