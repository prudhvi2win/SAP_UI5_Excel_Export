sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], (Controller, formatter, Filter, FilterOperator, History, MessageToast) => {
    "use strict";

    return Controller.extend("com.practice.northwind.controller.View2", {
        formatter: formatter,
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            // Attach a handler to extract parameters when this screen route matches
            oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sProductID = oEvent.getParameter("arguments").productID;
            
            // Perform explicit Element Binding to look exactly at the chosen entry path and expand Category and Supplier
            this.getView().bindElement({
                path: "/Products(" + sProductID + ")",
                parameters: {
                    expand: "Category, Supplier, Order_Details"
                }
            });
        },

        // Handles the back button navigation click action
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView1", {}, true);
            }
        }
    });
});