import express from "express";
import { deleteCustomer, getCustomerDetail, getCustomers, searchCustomers, upsertCustomer } from "./customers.service";
import { getOrdersForCustomer } from "../orders/orders.service";
import { customerPOSTRequestSchema, idUUIDRequestSchema } from "../types";
import { validate } from "../../middleware/validation.middleware";
import { CustomersPermissions, SecurityPermissions } from "../../config/permissions";
import { checkRequiredScope, validateAccessTkn } from "../../middleware/auth0.middleware";

export const customersRouter = express.Router();

customersRouter.get("/", validateAccessTkn,checkRequiredScope(CustomersPermissions.Read), async(req, res) => {
    const customers = await getCustomers();
    res.json(customers);
  });
  
 /* customersRouter.get("/:customerid", async(req, res) => {
    const customerid = req.params.customerid;
    const customer = await getCustomerDetail(customerid) ; 
    if (customer!=null){
      res.json(customer);
    }else{
      res.status(404).json({message:"customer not found"});
    }
  });
*/

  customersRouter.get("/:id", validateAccessTkn,checkRequiredScope(CustomersPermissions.Read_Single), validate(idUUIDRequestSchema), async(req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const customer = await getCustomerDetail(data.params.id) ; 
    if (customer!=null){
      res.json(customer);
    }else{
      res.status(404).json({message:"customer not found"});
    }
  });

  customersRouter.post("/", checkRequiredScope(CustomersPermissions.Create), validate(customerPOSTRequestSchema), async(req, res) => {
    const data = customerPOSTRequestSchema.parse(req);
    const customer = await upsertCustomer(data.body) ; 
    if (customer!=null){
      res.status(201).json(customer);
    }else{
      res.status(500).json({message:"customer not created"});
    }
  });

  customersRouter.get("/:customerid/orders", checkRequiredScope(CustomersPermissions.Read_Single), async(req, res) => {
    const customerid = req.params.customerid;
    const orders = await getOrdersForCustomer(customerid) ; 
    res.json(orders);
  });

  customersRouter.get("/search/:filter", checkRequiredScope(CustomersPermissions.Read) , async(req, res) => {
    const query = req.params.filter;
    const customers = await searchCustomers(query);
    res.json(customers);
  });

  customersRouter.delete("/:id", checkRequiredScope(SecurityPermissions.Deny) , validate(idUUIDRequestSchema), async(req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const customer = await deleteCustomer(data.params.id) ; 
    if (customer!=null){
      res.json(customer.name+" successfully deleted");
    }else{
      res.status(404).json({message:"customer not found so not deleted"});
    }
  });