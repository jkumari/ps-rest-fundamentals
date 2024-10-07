import express from "express";
import { deleteItem, getItemDetail, getItems, upsertItem } from "./items.service";
import {   idNumberRequestSchema, itemPOSTRequestSchema, itemPUTRequestSchema } from "../types";
import { validate } from "../../middleware/validation.middleware";
import { create } from "xmlbuilder2";
import { checkRequiredScope, validateAccessTkn } from "../../middleware/auth0.middleware";
import { ItemsPermissions, SecurityPermissions } from "../../config/permissions";


export const itemsRouter = express.Router();

itemsRouter.get("/", async(req, res) => {
  const items = await getItems();
  items.forEach((itemX) => {
    itemX.imageUrl = buildImageUrl(req, itemX.id);
  });
  if (req.headers["accept"]=="application/xml"){
    const root = create().ele("items");
    items.forEach((i)=>{
      root.ele("item",i); 
    });
    res.status(200).send(root.end({prettyPrint : true}));  
  } else {
    res.json(items);
  }
});

itemsRouter.get("/:id", validate(idNumberRequestSchema) ,async(req, res) => {
  const data  = idNumberRequestSchema.parse(req);
  const item = await getItemDetail(data.params.id) ; 
  if (item!=null){
    item.imageUrl = buildImageUrl(req,data.params.id); 
    res.json(item);
  }else{
    res.status(404).json({message:"item not found"});
  }
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function buildImageUrl(req: any, id: number): string {2
  return `${req.protocol}://${req.get("host")}/images/${id}.jpg`;
}

itemsRouter.post("/", validateAccessTkn, checkRequiredScope(ItemsPermissions.Create) , validate(itemPOSTRequestSchema), async(req, res) => {
  const data = itemPOSTRequestSchema.parse(req);
  const item = await upsertItem(data.body);
  if (item !=null){
    res.status(201).json(item);
  } else{
    res.status(500).json( {message: "error creating item"});
  }
});

itemsRouter.put("/:id", validateAccessTkn, checkRequiredScope(ItemsPermissions.Write) , validate(itemPUTRequestSchema) ,async(req, res) => {
  const data  = itemPUTRequestSchema.parse(req);
  const item = await upsertItem(data.body,data.params.id) ; 
  if (item!=null){
    res.json(item);
  }else{
    res.status(404).json({message:"item not found so not updated"});
  }
});

itemsRouter.delete("/:id", validateAccessTkn, checkRequiredScope(SecurityPermissions.Deny) , validate(idNumberRequestSchema) ,async(req, res) => {
  const data  = idNumberRequestSchema.parse(req);
  const item = await deleteItem(data.params.id) ; 
  if (item!=null){
    res.json(item.name+" successfully deleted");
  }else{
    res.status(404).json({message:"item not found so not deleted"});
  }
});