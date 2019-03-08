import express from "express";
import { RouteLookup } from "../controllers/lookups/stringLookup";
import * as ProductListingRouteController from "../controllers/productListingRouteController";

function productListingRoutes(server: express.Express) {
	server.get(RouteLookup.ProductListing, ProductListingRouteController.start);
}

module.exports.routes = productListingRoutes;
