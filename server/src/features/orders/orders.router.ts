import express from "express";
import { addOrderItems, deleteOrder, deleteOrderItem, getOrderDetail, getOrders, upsertOrder } from "./orders.service";
import { validate } from "../../middleware/validation.middleware";
import { idItemIdUUIDRequestSchema, idUUIDRequestSchema,  orderItemsDTORequestSchema,  orderPOSTRequestSchema, pagingRequestSchema } from "../types";
import { OrdersPermissions, SecurityPermissions } from "../../config/permissions";
import { checkRequiredScope } from "../../middleware/auth0.middleware";



export const ordersRouter = express.Router();

ordersRouter.get("/", checkRequiredScope(OrdersPermissions.Read), validate(pagingRequestSchema), async(req, res) => {
    
  const data = pagingRequestSchema.parse(req);
  const orders = await getOrders(data.query.skip, data.query.take);

res.json(orders);

  }); 

  ordersRouter.get("/:id", checkRequiredScope(OrdersPermissions.Read_Single), validate(idUUIDRequestSchema) , async(req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const order = await getOrderDetail(data.params.id);
    if (order !=null){
      res.json(order);
    } else{
      res.status(404).json( {message: "order not found"});
    }
  });


  ordersRouter.post("/", checkRequiredScope(OrdersPermissions.Create), validate(orderPOSTRequestSchema), async(req, res) => {
    const data = orderPOSTRequestSchema.parse(req);
    const order = await upsertOrder(data.body);
    if (order !=null){
      res.status(201).json(order);
    } else{
      res.status(500).json( {message: "error creating order"});
    }
  });

  ordersRouter.post("/:id/items", checkRequiredScope(OrdersPermissions.Create), validate(orderItemsDTORequestSchema), async(req, res) => {
    const data = orderItemsDTORequestSchema.parse(req);
    const order = await addOrderItems(data.params.id, data.body); 
    if (order !=null){
      res.status(201).json(order);
    } else{
      res.status(500).json( {message: "error adding to order"});
    }
  });

  ordersRouter.delete("/:id/items/:itemId", checkRequiredScope(OrdersPermissions.Create), validate(idItemIdUUIDRequestSchema), async(req, res) => {
    const data = idItemIdUUIDRequestSchema.parse(req);
    const order = await deleteOrderItem(data.params.id, data.params.itemId); 
    if (order !=null){
      res.status(201).json(order);
    } else{
      res.status(500).json( {message: "error deleting from order"}); 
    }
  });


  ordersRouter.delete("/:id", checkRequiredScope(SecurityPermissions.Deny), validate(idUUIDRequestSchema) , async(req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const order = await deleteOrder(data.params.id); 
    if (order !=null){
      res.json(order.id +" (status="+order.status+") successfully deleted");
    } else{
      res.status(404).json( {message: "order not found so not deleted"});
    }
  });