import { Router } from "express";
import sellerRequestController from "../controllers/sellerRequest.js";

const route = new Router();

// POST: submit a seller upgrade request (for buyers)
route.post('/request', sellerRequestController.submitRequest);

// GET: get current user's request status
route.get('/my-request', sellerRequestController.getMyRequest);

// GET: get all requests (admin only)
route.get('/requests', sellerRequestController.getAllRequests);

// POST: approve a request (admin only)
route.post('/requests/:id/approve', sellerRequestController.approveRequest);

// POST: reject a request (admin only)
route.post('/requests/:id/reject', sellerRequestController.rejectRequest);

export default route;
